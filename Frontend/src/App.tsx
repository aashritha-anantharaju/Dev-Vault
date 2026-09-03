import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotes, deleteNote } from './api'
import type { Note } from './api'
import { NoteForm } from './components/notes/form'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Database, 
  Clock, 
  Folder,
  BookOpen
} from 'lucide-react'

function App() {
  const queryClient = useQueryClient()

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
    onError: (err) => {
      console.error(err)
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the note.')
    }
  })

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this developer note?')) {
      deleteNoteMutation.mutate(id)
    }
  }

  // Debounce search input
  useEffect(() => {
    if (!searchQuery) {
      setDebouncedSearchQuery('')
      return
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Notes
  const {
    data: notes = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching
  } = useQuery<Note[]>({
    queryKey: ['notes', debouncedSearchQuery],
    queryFn: () => fetchNotes(debouncedSearchQuery),
  })

  // Format Query Error
  const error = useMemo(() => {
    if (!queryError) return null
    return queryError instanceof Error
      ? queryError.message
      : 'Could not connect to the API backend. Make sure the backend server is running.'
  }, [queryError])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null) // null = creating, Note = editing
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // Since search is handled on the backend, filteredNotes is directly the fetched notes
  const filteredNotes = notes

  // Open modal for creating a new note
  const handleOpenCreateModal = () => {
    setCurrentNote(null)
    setIsModalOpen(true)
  }

  // Open modal for editing a note
  const handleOpenEditModal = (note: Note) => {
    setCurrentNote(note)
    setIsModalOpen(true)
  }

  // Stats calculation
  const totalNotes = notes.length
  const lastUpdated = useMemo(() => {
    if (notes.length === 0) return 'Never'
    const dates = notes
      .map((n) => new Date(n.updatedAt || n.createdAt || 0).getTime())
      .filter((t) => t > 0)
    if (dates.length === 0) return 'Never'
    return new Date(Math.max(...dates)).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [notes])

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 text-foreground pb-12">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              DV
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">DevVault</h1>
              <p className="hidden sm:block text-xs text-muted-foreground">Your personal developer repository of guides, tips, and links</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isLoading || isRefetching}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Refresh</span>
            </Button>
            <Button size="sm" onClick={handleOpenCreateModal} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="flex items-center gap-4 p-5 hover:shadow-xs transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Resources</p>
              <h3 className="text-2xl font-bold tracking-tight mt-0.5">{totalNotes}</h3>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4 p-5 hover:shadow-xs transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</p>
              <h3 className="text-lg font-semibold tracking-tight mt-0.5">{lastUpdated}</h3>
            </div>
          </Card>
        </section>

        {/* Search & Filter Bar */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes, tags, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        {/* Main Grid & Loading States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          </div>
        ) : (
          <section className="space-y-6">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed border-border rounded-2xl bg-muted/10">
                <Folder className="h-12 w-12 text-muted-foreground/60 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No items found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  {searchQuery ? `No notes matching "${searchQuery}"` : "Get started by adding your first developer resource to DevVault!"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleOpenCreateModal} className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Create Note
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <Card key={note._id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow group">
                    {/* Header Image or Custom Styled Placeholder */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {note.image && !imageErrors[note._id] ? (
                        <img 
                          src={note.image} 
                          alt={note.title} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          onError={() => {
                            setImageErrors((prev) => ({ ...prev, [note._id]: true }))
                          }} 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-indigo-500/10 text-primary">
                          <BookOpen className="h-10 w-10 opacity-60" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex h-7 items-center justify-center rounded-md bg-background/90 px-2 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs text-foreground/80 shadow-xs border border-border/30">
                        {note.link ? 'Resource' : 'Local'}
                      </div>
                    </div>

                    <CardHeader className="flex-1 p-5 gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-bold line-clamp-1 text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                        <span className="text-[11px] text-muted-foreground font-medium shrink-0 pt-0.5">
                          {note.createdAt && new Date(note.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mt-1">
                        {note.description}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="flex items-center justify-between p-5 pt-0 mt-auto border-t border-border/40 bg-muted/10">
                      {note.link ? (
                        <a 
                          href={note.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Link
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic font-medium">No Link</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon-xs" 
                          onClick={() => handleOpenEditModal(note)} 
                          title="Edit Note"
                          className="hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-xs" 
                          onClick={() => handleDeleteNote(note._id)} 
                          title="Delete Note"
                          className="hover:bg-destructive/10 hover:text-destructive group/delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover/delete:text-destructive" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Add / Edit Modal using Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <NoteForm currentNote={currentNote} onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
