// app/notes/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { Notebook, Trash2, Edit, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import api from '@/lib/api'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const NoteDetailPage = () => {
  const { id } = useParams()
  const { user } = useUser()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchNote = async () => {
      if (!user || !id) return
      
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/notes/${id}`)
        
        console.log('Note API Response:', response.data) // Debug log
        
        // Handle different response formats
        let noteData: Note | null = null
        
        if (response.data && response.data.id) {
          noteData = response.data
        } else if (response.data && response.data.note && response.data.note.id) {
          noteData = response.data.note
        } else if (response.data && response.data.data && response.data.data.id) {
          noteData = response.data.data
        }
        
        setNote(noteData)
      } catch (error: any) {
        console.error('Failed to fetch note', error)
        if (error.response?.status === 404) {
          setError('Note not found')
        } else {
          setError('Failed to load note. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (user && id) {
      fetchNote()
    }
  }, [id, user])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      setDeleting(true)
      await api.delete(`/notes/${id}`)
      router.push('/notes')
    } catch (error) {
      console.error('Failed to delete note', error)
      alert('Failed to delete note. Please try again.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-8 w-full mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Notebook className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error || 'Note not found'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error === 'Note not found' 
            ? 'The note you are looking for doesn\'t exist or has been deleted.'
            : 'There was an error loading the note.'
          }
        </p>
        <Link href="/notes">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/notes">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
          <div className="flex gap-2">
            <Link href={`/notes/${note.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {note.tags.map((tag: string) => (
              <span key={tag} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{note.content}</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Created: {new Date(note.createdAt).toLocaleString()} | 
        Updated: {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  )
}

export default NoteDetailPage