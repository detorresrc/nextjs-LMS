'use client'

import { FC, useState } from 'react'
import * as z from 'zod'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
    Form,
    FormControl,
    FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
    isFree: z.boolean().default(false),
})

interface ChapterAccessProps {
    initialData: Chapter
    courseId: string
    chapterId: string
}

const ChapterAccessForm: FC<ChapterAccessProps> = ({
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
            isFree: initialData.isFree,
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
                Chapter access
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Access
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <div
                    className={cn(
                        'text-sm mt-2',
                        !initialData.isFree && 'text-slate-500 italic'
                    )}
                >
                    {initialData.isFree ? (
                        <>This chapter is free for preview</>
                    ) : (
                        <>This chapter is not free</>
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
                            name="isFree"
                            render={({ formState, field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormDescription>
                                            Check this box if you want to make
                                            this chapter free for preview.
                                        </FormDescription>
                                    </div>
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

export default ChapterAccessForm
