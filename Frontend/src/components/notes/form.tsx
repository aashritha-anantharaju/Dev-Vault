import { useState, useEffect, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as yup from 'yup'
import { createNote, updateNote } from '../../api'
import type { Note } from '../../api'
import { NoteFormUI } from './NoteFormUI'
import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'

const noteSchema = yup.object({
  title: yup.string().trim().required('Title is required.'),
  description: yup.string().trim().required('Description / Content is required.'),
  link: yup.string().trim().url('Reference URL must be a valid URL.').transform((value) => (!value ? undefined : value)),
  image: yup.string(),
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
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-left text-foreground">
            {currentNote ? 'Edit Developer Note' : 'Add Developer Note'}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-left">
            {formError}
          </div>
        )}

        <NoteFormUI />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : currentNote ? 'Update Note' : 'Create Note'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
