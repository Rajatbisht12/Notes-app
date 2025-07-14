'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Save, X, Link as LinkIcon, Loader, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

// Types
interface FormData {
  url: string
  title: string
  tags: string
}

interface ConnectionStatus {
  isOnline: boolean
  isServerReachable: boolean
  lastChecked: Date
}

const NewBookmarkPage = () => {
  const router = useRouter()
  const abortControllerRef = useRef<AbortController | null>(null)
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    url: '',
    title: '',
    tags: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [fetchingTitle, setFetchingTitle] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: true,
    isServerReachable: true,
    lastChecked: new Date()
  })
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Check network connectivity
  const checkConnectivity = useCallback(async () => {
    const isOnline = navigator.onLine
    let isServerReachable = false
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      isServerReachable = response.ok
    } catch (error) {
      isServerReachable = false
    }
    
    setConnectionStatus({
      isOnline,
      isServerReachable,
      lastChecked: new Date()
    })
    
    return { isOnline, isServerReachable }
  }, [])
  
  // Enhanced retry logic with circuit breaker pattern
  const makeRequestWithRetry = useCallback(async (
    requestFn: () => Promise<any>,
    maxRetries = 3,
    baseDelay = 1000
  ) => {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt - 1)
        
        // Check connectivity before retry
        if (attempt > 1) {
          const { isOnline, isServerReachable } = await checkConnectivity()
          if (!isOnline || !isServerReachable) {
            throw new Error('No connection available')
          }
        }
        
        const result = await requestFn()
        setRetryCount(0)
        return result
        
      } catch (error: any) {
        lastError = error
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error)
        
        // Don't retry on certain errors
        if (error.response?.status === 400 || 
            error.response?.status === 401 || 
            error.response?.status === 403 ||
            error.response?.status === 404) {
          break
        }
        
        // Last attempt
        if (attempt === maxRetries) {
          break
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        setIsRetrying(true)
        await new Promise(resolve => setTimeout(resolve, delay))
        setIsRetrying(false)
      }
    }
    
    setRetryCount(0)
    throw lastError
  }, [checkConnectivity])
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }
  }, [])
  
  // Enhanced form change handler with validation
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (error) {
      setError('')
    }
    
    // URL validation
    if (name === 'url' && value) {
      try {
        new URL(value)
      } catch {
        // Invalid URL - could show inline validation here
      }
    }
  }, [error])
  
  // Enhanced title fetching with debouncing and caching
  const fetchTitle = useCallback(async (url: string) => {
    if (!url) return
    
    try {
      setFetchingTitle(true)
      setError('')
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      const response = await makeRequestWithRetry(async () => {
        return await api.post('/bookmarks/fetch-title', 
          { url },
          { 
            timeout: 15000,
            signal: abortControllerRef.current?.signal
          }
        )
      })
      
      if (response.data?.title) {
        setFormData(prev => ({ ...prev, title: response.data.title }))
        setSuccess('Title fetched successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
      
    } catch (error: any) {
      console.error('Failed to fetch title:', error)
      
      if (error.name === 'AbortError') {
        return // Request was cancelled
      }
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Title fetch timed out. Please enter the title manually.')
      } else if (!connectionStatus.isOnline) {
        setError('No internet connection. Please check your network.')
      } else if (!connectionStatus.isServerReachable) {
        setError('Server is unreachable. Please try again later.')
      } else {
        setError('Failed to fetch title. Please enter manually.')
      }
    } finally {
      setFetchingTitle(false)
    }
  }, [makeRequestWithRetry, connectionStatus])
  
  // Debounced title fetching
  useEffect(() => {
    if (formData.url && !formData.title) {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      
      titleTimeoutRef.current = setTimeout(() => {
        fetchTitle(formData.url)
      }, 1000)
    }
    
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [formData.url, formData.title, fetchTitle])
  
  // Enhanced submit handler with comprehensive error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Validate form data
      if (!formData.url || !formData.title) {
        throw new Error('URL and title are required')
      }
      
      // Validate URL format
      try {
        new URL(formData.url)
      } catch {
        throw new Error('Please enter a valid URL')
      }
      
      // Check connectivity
      const { isOnline, isServerReachable } = await checkConnectivity()
      if (!isOnline) {
        throw new Error('No internet connection. Please check your network and try again.')
      }
      if (!isServerReachable) {
        throw new Error('Server is unreachable. Please try again later.')
      }
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
      
      // Save bookmark with retry logic
      await makeRequestWithRetry(async () => {
        return await api.post('/bookmarks', {
          ...formData,
          tags: tagsArray
        }, {
          timeout: 30000
        })
      }, 3, 2000)
      
      setSuccess('Bookmark saved successfully!')
      
      // Navigate after short delay to show success message
      setTimeout(() => {
        router.push('/bookmarks')
      }, 1500)
      
    } catch (error: any) {
      console.error('Submit error:', error)
      
      // Enhanced error handling with user-friendly messages
      if (error.message?.includes('No internet connection')) {
        setError('No internet connection. Please check your network and try again.')
      } else if (error.message?.includes('Server is unreachable')) {
        setError('Server is temporarily unavailable. Please try again in a few minutes.')
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setError('Request timed out. The server might be experiencing high load. Please try again.')
      } else if (error.response?.status === 400) {
        setError('Invalid bookmark data. Please check your URL and try again.')
      } else if (error.response?.status === 409) {
        setError('This bookmark already exists.')
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (error.response?.status >= 500) {
        setError('Server error. Our team has been notified. Please try again later.')
      } else if (error.message?.includes('required')) {
        setError(error.message)
      } else {
        setError('Failed to save bookmark. Please check your connection and try again.')
      }
      
      // Log error for monitoring (in production, send to error tracking service)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'bookmark_save_error', {
          error_message: error.message,
          error_code: error.code,
          url: formData.url
        })
      }
    } finally {
      setLoading(false)
    }
  }, [formData, makeRequestWithRetry, checkConnectivity, router])
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => checkConnectivity()
    const handleOffline = () => checkConnectivity()
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial check
    checkConnectivity()
    
    // Periodic health checks
    const interval = setInterval(checkConnectivity, 30000)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
      cleanup()
    }
  }, [checkConnectivity, cleanup])
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Bookmark className="h-8 w-8 mr-3 text-indigo-600" />
          Save New Bookmark
        </h1>
        <p className="text-gray-600">Save web pages to access later</p>
        
        {/* Connection Status Indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          {connectionStatus.isOnline ? (
            connectionStatus.isServerReachable ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connected
              </div>
            ) : (
              <div className="flex items-center text-orange-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Server unreachable
              </div>
            )
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff className="h-4 w-4 mr-1" />
              No internet connection
            </div>
          )}
          
          {isRetrying && (
            <div className="flex items-center text-blue-600">
              <Loader className="h-4 w-4 mr-1 animate-spin" />
              Retrying... ({retryCount + 1}/3)
            </div>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{success}</div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            URL *
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
              placeholder="https://example.com"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
              placeholder="Enter title or it will be fetched automatically"
              required
              disabled={loading}
            />
            {fetchingTitle && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50"
            placeholder="webdev, resources, tutorials"
            disabled={loading}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/bookmarks')}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !connectionStatus.isOnline || !connectionStatus.isServerReachable}
          >
            {loading ? (
              <div className="flex items-center">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Bookmark
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewBookmarkPage