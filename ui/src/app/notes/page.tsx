// app/notes/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Search, Notebook } from 'lucide-react'
import NoteList from '@/components/NoteList'
import api from '@/lib/api'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const NotesPage = () => {
  const { user } = useUser()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (tags) params.append('tags', tags)
      
      const response = await api.get(`/notes?${params.toString()}`)
      
      console.log('API Response:', response.data) // Debug log
      
      // Handle different response formats
      let notesData: Note[] = []
      
      if (Array.isArray(response.data)) {
        notesData = response.data
      } else if (response.data && Array.isArray(response.data.notes)) {
        notesData = response.data.notes
      } else if (response.data && Array.isArray(response.data.data)) {
        notesData = response.data.data
      } else {
        console.error('Unexpected response format:', response.data)
        notesData = []
      }
      
      setNotes(notesData)
    } catch (error) {
      console.error('Failed to fetch notes', error)
      setError('Failed to load notes. Please try again.')
      setNotes([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNotes()
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchNotes}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Notebook className="h-8 w-8 mr-3 text-indigo-600" />
          Your Notes
        </h1>
        <p className="text-gray-600">Create, organize, and access your notes anytime</p>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        <Link href="/notes/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </Link>
      </div>
      
      <NoteList notes={notes} loading={loading} onDelete={fetchNotes} />
    </div>
  )
}

export default NotesPage