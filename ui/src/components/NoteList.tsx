import { Skeleton } from '@/components/ui/skeleton'
import { Notebook, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import Link from 'next/link'

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const NoteList = ({ notes, loading, onDelete }: { 
  notes: Note[]; 
  loading: boolean; 
  onDelete: () => void; 
}) => {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${id}`)
        onDelete()
      } catch (error) {
        console.error('Failed to delete note', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-xl">
        <Notebook className="h-16 w-16 mx-auto text-gray-400" />
        <h3 className="mt-4 text-xl font-medium text-gray-900">No notes yet</h3>
        <p className="mt-2 text-gray-500">Get started by creating a new note</p>
        <div className="mt-6">
          <Link href="/notes/new">
            <Button>
              Create Note
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {notes.map(note => (
        <div key={note.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow">
          <div className="flex justify-between">
            <Link href={`/notes/${note.id}`} className="block flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                {note.title}
              </h3>
            </Link>
            <div className="flex gap-2">
              <Link href={`/notes/${note.id}/edit`}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => handleDelete(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="mt-2 text-gray-600 line-clamp-2">
            {note.content}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}

export default NoteList