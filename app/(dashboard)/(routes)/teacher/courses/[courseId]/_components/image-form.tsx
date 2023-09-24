'use client'

import { FC, useState } from 'react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FileUpload from '@/components/file-upload'

interface ImageFormProps {
    initialData: {
        imageUrl: string | null
    }
    courseId: string
}

const ImageForm: FC<ImageFormProps> = ({ courseId, initialData }) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const toggleEdit = () => setIsEditing((prev) => !prev)

    const onSubmit = async (values: { imageUrl: string }) => {
        try {
            const { data } = await axios.patch(
                '/api/courses/' + courseId,
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

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course Image
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData?.imageUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Image
                        </>
                    )}
                    {!isEditing && initialData?.imageUrl && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Image
                        </>
                    )}
                </Button>
            </div>

            {!isEditing &&
                (!initialData?.imageUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <ImageIcon className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image
                            alt="upload"
                            fill
                            className="object-cover rounded-md"
                            src={initialData.imageUrl}
                        />
                    </div>
                ))}

            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseImage"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ imageUrl: url })
                            }
                        }}
                    />

                    <div className="text-xs text-muted-foreground mt-4">
                        16:9 aspect ratio recommended
                    </div>
                </div>
            )}
        </div>
    )
}

export default ImageForm
