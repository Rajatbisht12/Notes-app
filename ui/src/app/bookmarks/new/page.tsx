'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Save, X, Link as LinkIcon, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const NewBookmarkPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  const [fetchingTitle, setFetchingTitle] = useState(false)
  const [error, setError] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const fetchTitle = async () => {
    if (!formData.url) return
    
    try {
      setFetchingTitle(true)
      const response = await api.post('/bookmarks/fetch-title', { url: formData.url })
      setFormData(prev => ({ ...prev, title: response.data.title }))
    } catch (error) {
      console.error('Failed to fetch title', error)
      setError('Failed to fetch title. Please enter manually.')
    } finally {
      setFetchingTitle(false)
    }
  }
  
  useEffect(() => {
    if (formData.url && !formData.title) {
      const timer = setTimeout(() => {
        fetchTitle()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [formData.url])
  
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
    
  //   try {
  //     const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  //     await api.post('/bookmarks', {
  //       ...formData,
  //       tags: tagsArray
  //     })
  //     router.push('/bookmarks')
  //   } catch (error) {
  //     console.error('Failed to create bookmark', error)
  //     setError('Failed to create bookmark. Please try again.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  
  try {
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    await api.post('/bookmarks', {
      ...formData,
      tags: tagsArray
    })
    
      router.push('/bookmarks')
  } catch (error: any) {
    console.error('Submit error:', error)
    
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      setError('Cannot connect to server. Please ensure the backend is running on port 5000.')
    } else if (error.response?.status === 400) {
      setError('Invalid bookmark data. Please check your URL and try again.')
    } else if (error.response?.status === 500) {
      setError('Server error. Please try again later.')
    } else {
      setError('Failed to save bookmark. Please check your connection and try again.')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Bookmark className="h-8 w-8 mr-3 text-indigo-600" />
          Save New Bookmark
        </h1>
        <p className="text-gray-600">Save web pages to access later</p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="webdev, resources, tutorials"
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
          <Button type="submit" disabled={loading}>
            {loading ? (
              'Saving...'
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