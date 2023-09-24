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
import toast from 'react-hot-toast'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Chapter } from '@prisma/client'
import Editor from '@/components/editor'
import Preview from '@/components/preview'
import { cn } from '@/lib/utils'

const formSchema = z.object({
    description: z.string().min(1, {
        message: 'Description is required',
    }),
})

interface ChapterDescriptionProps {
    initialData: Chapter
    courseId: string
    chapterId: string
}

const ChapterDescriptionForm: FC<ChapterDescriptionProps> = ({
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
            description: initialData.description || '',
        },
    })

    const { isSubmitting, isValid } = form.formState

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
                Chapter Description
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Description
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <div
                    className={cn(
                        'text-sm mt-2',
                        !initialData.description && 'text-slate-500 italic'
                    )}
                >
                    {!initialData.description && 'No description'}
                    {initialData.description && (
                        <Preview value={initialData.description} />
                    )}
                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 mt-8"
                    >
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ formState, field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Editor
                                            value={field.value}
                                            onChange={field.onChange}
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
                                Update
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}

export default ChapterDescriptionForm
