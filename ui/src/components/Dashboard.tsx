// components/Dashboard.tsx
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Notebook, Bookmark, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useUser()
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [notesRes, bookmarksRes] = await Promise.all([
          api.get('/notes?limit=3'),
          api.get('/bookmarks?limit=3')
        ])
        
        setRecentNotes(notesRes.data)
        setRecentBookmarks(bookmarksRes.data)
      } catch (error) {
        console.error('Failed to fetch data', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      fetchData()
    }
  }, [user])

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-600">Here&apos;s what you&apos;ve been working on recently</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Notebook className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Notes
            </h2>
            <Link href="/notes/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <DashboardSkeleton />
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven&apos;t created any notes yet</p>
              <Link href="/notes/new">
                <Button>Create your first note</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNotes.map(note => (
                <Link 
                  key={note.id} 
                  href={`/notes/${note.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold truncate">{note.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <Link href="/notes" className="block mt-6 text-center text-indigo-600 hover:text-indigo-800 font-medium">
            View all notes
          </Link>
        </div>
        
        {/* Recent Bookmarks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Bookmarks
            </h2>
            <Link href="/bookmarks/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <DashboardSkeleton />
          ) : recentBookmarks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven&apos;t created any notes yet</p>
              <Link href="/bookmarks/new">
                <Button>Save your first bookmark</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookmarks.map(bookmark => (
                <div 
                  key={bookmark.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Link href={`/bookmarks/${bookmark.id}`} className="block">
                    <h3 className="font-semibold truncate">{bookmark.title}</h3>
                  </Link>
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 truncate block mt-1"
                  >
                    {bookmark.url}
                  </a>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bookmark.tags.map(tag => (
                      <span key={tag} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Link href="/bookmarks" className="block mt-6 text-center text-indigo-600 hover:text-indigo-800 font-medium">
            View all bookmarks
          </Link>
        </div>
      </div>
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 border border-gray-200 rounded-lg">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

export default Dashboard;