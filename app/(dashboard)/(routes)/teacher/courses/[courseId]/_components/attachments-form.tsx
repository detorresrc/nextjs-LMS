'use client'

import { FC, useState } from 'react'
import axios from 'axios'

import * as z from 'zod'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { PlusCircle, File, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/file-upload'
import { Attachment, Course } from '@prisma/client'

interface AttachmentsFormProps {
    initialData: Course & { attachments: Attachment[] }
    courseId: string
}

const formSchema = z.object({
    url: z.string().min(1),
})

const AttachmentsForm: FC<AttachmentsFormProps> = ({
    courseId,
    initialData,
}) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const toggleEdit = () => setIsEditing((prev) => !prev)

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { data } = await axios.post(
                '/api/courses/' + courseId + '/attachments',
                values
            )
            toast.success('Course updated!', {
                position: 'top-right',
            })
            toggleEdit()
            router.refresh()
        } catch (e: any) {
            console.log(e.message)
            toast.error('Something went wrong!', {
                position: 'top-right',
            })
        }
    }

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id)
            await axios.delete(
                '/api/courses/' + courseId + '/attachments/' + id
            )
            toast.success('Attachment deleted')
            router.refresh()
        } catch (e: any) {
            console.log(e.message)
            toast.error('Something went wrong!', {
                position: 'top-right',
            })
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course Attachments
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add File
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <>
                    {initialData.attachments.length === 0 && (
                        <p className="text-sm mt-2 text-slate-500 italic">
                            No Attachments yet
                        </p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className="space-y-2">
                            {initialData.attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md hover:opacity-75 transition"
                                >
                                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <p className="text-xs line-clamp-1">
                                        {attachment.name}
                                    </p>
                                    {deletingId === attachment.id && (
                                        <div>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    )}
                                    {deletingId !== attachment.id && (
                                        <button
                                            onClick={() =>
                                                onDelete(attachment.id)
                                            }
                                            className="ml-auto hover:opacity-75 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ url })
                            }
                        }}
                    />

                    <div className="text-xs text-muted-foreground mt-4">
                        Add anything your students might need to complete the
                        course.
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttachmentsForm
