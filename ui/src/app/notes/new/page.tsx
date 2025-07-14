// app/notes/new/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Notebook, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const NewNotePage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      await api.post('/notes', {
        ...formData,
        tags: tagsArray
      })
      router.push('/notes')
    } catch (error) {
      console.error('Failed to create note', error)
      alert('Failed to create note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Notebook className="h-8 w-8 mr-3 text-indigo-600" />
          Create New Note
        </h1>
        <p className="text-gray-600">Capture your thoughts and ideas</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
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
            placeholder="work, ideas, important"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/notes')}
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
                Save Note
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewNotePage