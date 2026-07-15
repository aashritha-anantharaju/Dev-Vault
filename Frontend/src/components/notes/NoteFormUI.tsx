import { useFormContext } from 'react-hook-form'

export function NoteFormUI() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          className="form-input"
          placeholder="e.g. Git Cheat Sheet, Docker Basics"
          {...register('title')}
        />
        {errors.title && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
            {errors.title.message as string}
          </span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description / Content *</label>
        <textarea
          id="description"
          className="form-textarea"
          placeholder="Summarize the core takeaways, command cheat sheets, or tips..."
          {...register('description')}
        />
        {errors.description && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
            {errors.description.message as string}
          </span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="link">Reference URL</label>
        <input
          id="link"
          type="text"
          className="form-input"
          placeholder="e.g. https://docs.docker.com"
          {...register('link')}
        />
        {errors.link && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
            {errors.link.message as string}
          </span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="image">Banner Image URL</label>
        <input
          id="image"
          type="text"
          className="form-input"
          placeholder="e.g. https://images.unsplash.com/photo-..."
          {...register('image')}
        />
        {errors.image && (
          <span style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>
            {errors.image.message as string}
          </span>
        )}
      </div>
    </>
  )
}
