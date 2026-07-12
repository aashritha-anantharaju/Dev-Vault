import { useState, useEffect, useMemo } from 'react'
import { fetchNotes, createNote, updateNote } from './api'
import type { Note } from './api'
import './App.css'

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null) // null = creating, Note = editing

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [link, setLink] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load Notes
  const loadNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchNotes()
      setNotes(data)
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Could not connect to the API backend. Make sure the backend server is running.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const init = async () => {
      try {
        const data = await fetchNotes()
        if (!ignore) {
          setNotes(data)
          setError(null)
          setLoading(false)
        }
      } catch (err) {
        if (!ignore) {
          console.error(err)
          const errorMessage = err instanceof Error ? err.message : 'Could not connect to the API backend. Make sure the backend server is running.'
          setError(errorMessage)
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [notes, searchQuery])

  // Open modal for creating a new note
  const handleOpenCreateModal = () => {
    setCurrentNote(null)
    setTitle('')
    setDescription('')
    setImage('')
    setLink('')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open modal for editing a note
  const handleOpenEditModal = (note: Note) => {
    setCurrentNote(note)
    setTitle(note.title)
    setDescription(note.description)
    setImage(note.image || '')
    setLink(note.link || '')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      const payload = {
        title: title.trim(),
        description: description.trim(),
        image: image.trim(),
        link: link.trim(),
      }

      if (currentNote) {
        // Edit Note
        const updated = await updateNote(currentNote._id, payload)
        setNotes((prev) => prev.map((n) => (n._id === currentNote._id ? updated : n)))
      } else {
        // Create Note
        const created = await createNote(payload)
        setNotes((prev) => [created, ...prev])
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the note.'
      setFormError(errorMessage)
    } finally {
      setSubmitting(false)
    }
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
    <>
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">DV</div>
          <div>
            <h1 className="app-title">DevVault</h1>
            <p className="app-subtitle">Your personal developer repository of guides, tips, and links</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={loadNotes} title="Refresh connection">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Note
          </button>
        </div>
      </header>

      {/* Stats Banner */}
      <section className="stats-banner">
        <div className="stat-card">
          <div className="stat-icon-container stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Resources</span>
            <span className="stat-value">{totalNotes}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-container stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Last Updated</span>
            <span className="stat-value" style={{ fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Search Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search notes, tags, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Grid */}
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <section className="notes-grid">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📁</span>
              <h3>No items found</h3>
              <p className="empty-text">
                {searchQuery ? `No notes matching "${searchQuery}"` : "Get started by adding your first developer resource to DevVault!"}
              </p>
              {!searchQuery && (
                <button className="btn btn-primary" onClick={handleOpenCreateModal} style={{ marginTop: '8px' }}>
                  Create Note
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <article className="note-card" key={note._id}>
                {note.image ? (
                  <img src={note.image} alt={note.title} className="note-image" onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                ) : (
                  <div className="note-placeholder-bg">
                    {note.title.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="note-content">
                  <div className="note-header">
                    <h2 className="note-title">{note.title}</h2>
                    <span className="note-date">
                      {note.createdAt && new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <p className="note-description">{note.description}</p>
                  
                  <div className="note-footer">
                    {note.link ? (
                      <a href={note.link} target="_blank" rel="noopener noreferrer" className="note-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Reference Link
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.5 }}>Local Doc</span>
                    )}

                    <div className="note-actions">
                      <button className="note-action-btn" onClick={() => handleOpenEditModal(note)} title="Edit Resource">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{currentNote ? 'Edit Developer Note' : 'Add Developer Note'}</h3>
            
            {formError && <div className="error-banner" style={{ marginBottom: '16px' }}>{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Git Cheat Sheet, Docker Basics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description / Content *</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Summarize the core takeaways, command cheat sheets, or tips..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="link">Reference URL</label>
                <input
                  id="link"
                  type="url"
                  className="form-input"
                  placeholder="e.g. https://docs.docker.com"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="image">Banner Image URL</label>
                <input
                  id="image"
                  type="url"
                  className="form-input"
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : currentNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
