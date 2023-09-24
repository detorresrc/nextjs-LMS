'use client'

import { FC, useState } from 'react'
import * as z from 'zod'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { Loader2, Pencil, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Chapter, Course } from '@prisma/client'
import ChapterList from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/chapter-list'

const formSchema = z.object({
    title: z.string().min(1),
})

interface ChaptersFormProps {
    initialData: Course & { chapters: Chapter[] }
    courseId: string
}

const ChaptersForm: FC<ChaptersFormProps> = ({ courseId, initialData }) => {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const toggleCreating = () => setIsCreating((prev) => !prev)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
        },
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/chapters`, values)
            toast.success('Chapter created!', {
                position: 'top-right',
            })
            toggleCreating()
            router.refresh()
        } catch (e: any) {
            console.log(e.message)
            toast.error('Something went wrong!', {
                position: 'top-right',
            })
        }
    }

    const onReorder = async (
        updateData: { id: string; position: number }[]
    ) => {
        try {
            setIsUpdating(true)

            await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
                list: updateData,
            })
            toast.success('Chapters reordered', {
                position: 'top-right',
            })
            router.refresh()
        } catch {
            toast.error('Something went wrong', {
                position: 'top-right',
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const onEdit = (id: string) => {
        router.push(`/teacher/courses/${courseId}/chapters/${id}`)
    }

    return (
        <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
            {isUpdating && (
                <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
                </div>
            )}
            <div className="font-medium flex items-center justify-between">
                Course Chapters
                <Button onClick={toggleCreating} variant="ghost">
                    {isCreating && <>Cancel</>}
                    {!isCreating && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Chapter
                        </>
                    )}
                </Button>
            </div>
            {isCreating && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 mt-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ formState, field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="Introduction for the course"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-x-2">
                            <Button
                                variant={'default'}
                                type={'submit'}
                                disabled={!isValid || isSubmitting}
                            >
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
            {!isCreating && (
                <div
                    className={cn(
                        'text-sm mt-2',
                        !initialData.chapters.length && 'text-slate-500'
                    )}
                >
                    {!initialData.chapters.length && 'No Chapters yet!'}
                    <ChapterList
                        chapters={initialData.chapters || []}
                        onEdit={onEdit}
                        onReorder={onReorder}
                    />
                </div>
            )}
            {!isCreating && (
                <p className="text-xs text-muted-foreground mt-4">
                    Drag and Drop to reorder the chapters
                </p>
            )}
        </div>
    )
}

export default ChaptersForm
