import { useState, useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as yup from 'yup'
import { createNote, updateNote } from '../../api'
import type { Note } from '../../api'
import { NoteFormUI } from './NoteFormUI'

const noteSchema = yup.object({
  title: yup.string().trim().required('Title is required.'),
  description: yup.string().trim().required('Description / Content is required.'),
  link: yup.string().trim().url('Reference URL must be a valid URL.').transform((value) => (!value ? undefined : value)),
  image: yup.string().trim().url('Banner Image URL must be a valid URL.').transform((value) => (!value ? undefined : value)),
})

interface NoteFormProps {
  currentNote: Note | null
  onClose: () => void
}

export function NoteForm({ currentNote, onClose }: NoteFormProps) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const defaultValues = useMemo(() => ({
    title: currentNote?.title || '',
    description: currentNote?.description || '',
    image: currentNote?.image || '',
    link: currentNote?.link || '',
  }), [currentNote])

  const methods = useForm({
    resolver: yupResolver(noteSchema),
    defaultValues,
  })

  // Synchronize form values when currentNote changes
  useEffect(() => {
    methods.reset(defaultValues)
    setFormError(null)
  }, [defaultValues, methods])

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      onClose()
    },
    onError: (err) => {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the note.'
      setFormError(errorMessage)
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: Parameters<typeof updateNote>[1] }) => updateNote(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      onClose()
    },
    onError: (err) => {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the note.'
      setFormError(errorMessage)
    }
  })

  const submitting = createNoteMutation.isPending || updateNoteMutation.isPending

  const onSubmit = (data: yup.InferType<typeof noteSchema>) => {
    setFormError(null)
    const payload = {
      title: data.title.trim(),
      description: data.description.trim(),
      image: data.image?.trim() || '',
      link: data.link?.trim() || '',
    }

    if (currentNote) {
      updateNoteMutation.mutate({ id: currentNote._id, note: payload })
    } else {
      createNoteMutation.mutate(payload)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <h3 className="modal-title">{currentNote ? 'Edit Developer Note' : 'Add Developer Note'}</h3>
        
        {formError && <div className="error-banner" style={{ marginBottom: '16px' }}>{formError}</div>}
        
        <NoteFormUI />

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : currentNote ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
