// app/bookmarks/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Plus, Search, Tag, ExternalLink, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface BookmarkItem {
  id: string
  url: string
  title: string
  tags: string[]
  createdAt: string
}

const BookmarksPage = () => {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookmarks')
      setBookmarks(Array.isArray(response.data) ? response.data : response.data.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks', error)
      setError('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    } catch (error) {
      console.error('Failed to delete bookmark', error)
      setError('Failed to delete bookmark')
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = !selectedTag || bookmark.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const allTags = [...new Set(bookmarks.flatMap(bookmark => bookmark.tags))]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center">
            <Bookmark className="h-8 w-8 mr-3 text-indigo-600" />
            My Bookmarks
          </h1>
          <Button onClick={() => router.push('/bookmarks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {bookmarks.length === 0 
              ? 'Start saving your favorite web pages' 
              : 'Try adjusting your search or filter'}
          </p>
          {bookmarks.length === 0 && (
            <Button onClick={() => router.push('/bookmarks/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Bookmark
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 break-all">
                    {bookmark.url}
                  </p>
                  
                  {bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bookmark.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(bookmark.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookmarksPage;