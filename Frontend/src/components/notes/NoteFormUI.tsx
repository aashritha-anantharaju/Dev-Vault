import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function NoteFormUI() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="title">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          type="text"
          placeholder="e.g. Git Cheat Sheet, Docker Basics"
          {...register('title')}
          className="mt-1"
        />
        {errors.title && (
          <span className="text-xs font-semibold text-destructive mt-0.5">
            {errors.title.message as string}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="description">
          Description / Content <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="description"
          placeholder="Summarize the core takeaways, command cheat sheets, or tips..."
          {...register('description')}
          className="mt-1 min-h-[100px]"
        />
        {errors.description && (
          <span className="text-xs font-semibold text-destructive mt-0.5">
            {errors.description.message as string}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="link">
          Reference URL
        </label>
        <Input
          id="link"
          type="text"
          placeholder="e.g. https://docs.docker.com"
          {...register('link')}
          className="mt-1"
        />
        {errors.link && (
          <span className="text-xs font-semibold text-destructive mt-0.5">
            {errors.link.message as string}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium leading-none text-muted-foreground" htmlFor="image">
          Banner Image URL
        </label>
        <Input
          id="image"
          type="text"
          placeholder="e.g. https://images.unsplash.com/photo-..."
          {...register('image')}
          className="mt-1"
        />
        {errors.image && (
          <span className="text-xs font-semibold text-destructive mt-0.5">
            {errors.image.message as string}
          </span>
        )}
      </div>
    </div>
  )
}
