'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Save, X, Link as LinkIcon, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

// Types
interface FormData {
  url: string
  title: string
  tags: string
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
  
  // Form change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (error) {
      setError('')
    }
  }, [error])
  
  // Title fetching
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
      
      const response = await api.post('/bookmarks/fetch-title', 
        { url },
        { 
          timeout: 15000,
          signal: abortControllerRef.current?.signal
        }
      )
      
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
      
      setError('Failed to fetch title. Please enter manually.')
    } finally {
      setFetchingTitle(false)
    }
  }, [])
  
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
  
  // Submit handler
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
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
      
      // Save bookmark
      await api.post('/bookmarks', {
        ...formData,
        tags: tagsArray
      }, {
        timeout: 30000
      })
      
      setSuccess('Bookmark saved successfully!')
      
      // Navigate after short delay to show success message
      setTimeout(() => {
        router.push('/bookmarks')
      }, 1500)
      
    } catch (error: any) {
      console.error('Submit error:', error)
      
      if (error.response?.status === 400) {
        setError('Invalid bookmark data. Please check your URL and try again.')
      } else if (error.response?.status === 409) {
        setError('This bookmark already exists.')
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else if (error.message?.includes('required')) {
        setError(error.message)
      } else {
        setError('Failed to save bookmark. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [formData, router])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Bookmark className="h-8 w-8 mr-3 text-indigo-600" />
          Save New Bookmark
        </h1>
        <p className="text-gray-600">Save web pages to access later</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          {success}
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
            disabled={loading}
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