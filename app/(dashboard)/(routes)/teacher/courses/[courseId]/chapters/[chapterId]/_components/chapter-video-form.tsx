'use client'

import { FC, useState } from 'react'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { Pencil, PlusCircle, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/file-upload'
import { Chapter, MuxData } from '@prisma/client'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import MuxPlayer from '@mux/mux-player-react'

interface ChapterVideoProps {
    initialData: Chapter & { muxData?: MuxData | null }
    courseId: string
    chapterId: string
}

const formSchema = z.object({
    videoUrl: z.string().min(1),
})

const ChapterVideo: FC<ChapterVideoProps> = ({
    courseId,
    chapterId,
    initialData,
}) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const toggleEdit = () => setIsEditing((prev) => !prev)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            videoUrl: initialData.videoUrl || '',
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { data } = await axios.patch(
                '/api/courses/' + courseId + '/chapters/' + chapterId,
                values
            )
            toast.success('Chapter updated!', {
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
                Chapter Video
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData?.videoUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Video
                        </>
                    )}
                    {!isEditing && initialData?.videoUrl && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Video
                        </>
                    )}
                </Button>
            </div>

            {!isEditing &&
                (!initialData?.videoUrl ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <Video className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <MuxPlayer
                            playbackId={initialData.muxData?.playbackId || ''}
                        ></MuxPlayer>
                    </div>
                ))}

            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="chapterVideo"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ videoUrl: url })
                            }
                        }}
                    />

                    <div className="text-xs text-muted-foreground mt-4">
                        Upload this chapter's video.
                    </div>
                </div>
            )}
            {initialData.videoUrl && ~isEditing && (
                <div className="text-xs text-muted-foreground mt-2">
                    Videos can take a few minutes to process.Refresh the page if
                    video does not appear.
                </div>
            )}
        </div>
    )
}

export default ChapterVideo
