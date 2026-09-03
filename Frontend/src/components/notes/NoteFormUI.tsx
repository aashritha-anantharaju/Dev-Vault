import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { uploadImage } from '../../api'
import { Upload, X, Loader2 } from 'lucide-react'
import heic2any from 'heic2any'

export function NoteFormUI() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()

  const imageUrl = watch('image')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
      if (isHeic) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        })
        const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
        const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
        file = new File([blobToUse], newFileName, { type: 'image/jpeg' })
      }

      const data = await uploadImage(file)
      setValue('image', data.url, { shouldValidate: true })
    } catch (err) {
      console.error(err)
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setValue('image', '', { shouldValidate: true })
    setUploadError(null)
  }

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
        <label className="text-sm font-medium leading-none text-muted-foreground">
          Banner Image
        </label>

        {/* Upload Container */}
        <div className="mt-1 border border-dashed border-border rounded-lg p-4 bg-muted/10 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden transition-colors hover:bg-muted/20">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Uploading image...</span>
            </div>
          ) : imageUrl ? (
            <div className="w-full relative group">
              <img
                src={imageUrl}
                alt="Banner preview"
                className="aspect-video w-full rounded-md object-cover border border-border"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  setUploadError('Invalid image URL or unable to load preview.');
                }}
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all opacity-90 hover:opacity-100"
                title="Remove Image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center cursor-pointer w-full py-4 text-center"
            >
              <Upload className="h-8 w-8 text-muted-foreground/80 mb-2" />
              <span className="text-sm font-medium text-foreground">Click to upload banner image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, GIF or WEBP (max 5MB)</span>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Manual URL Input Option */}
        <div className="mt-2 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Or paste a direct image URL</span>
          <Input
            id="image"
            type="text"
            placeholder="e.g. https://images.unsplash.com/photo-..."
            {...register('image')}
            className="mt-1"
          />
        </div>

        {uploadError && (
          <span className="text-xs font-semibold text-destructive mt-1">
            {uploadError}
          </span>
        )}

        {errors.image && (
          <span className="text-xs font-semibold text-destructive mt-0.5">
            {errors.image.message as string}
          </span>
        )}
      </div>
    </div>
  )
}
