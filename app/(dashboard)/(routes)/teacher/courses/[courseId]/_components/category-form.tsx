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
import { cn } from '@/lib/utils'
import Combobox from '@/components/ui/combobox'

const formSchema = z.object({
    categoryId: z.string().min(1, {
        message: 'Category is required',
    }),
})

interface CategoryFormProps {
    initialData: {
        categoryId: string | null
    }
    courseId: string
    options: { label: string; value: string }[]
}

const CategoryForm: FC<CategoryFormProps> = ({
    courseId,
    initialData,
    options,
}) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const toggleEdit = () => setIsEditing((prev) => !prev)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            categoryId: initialData.categoryId || '',
        },
    })

    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

    const selectedOption = options.find(
        (option) => option.value === initialData.categoryId
    )

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4 relative">
            <div className="font-medium flex items-center justify-between">
                Course Category
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Category
                        </>
                    )}
                </Button>
            </div>

            {!isEditing && (
                <p
                    className={cn(
                        'text-sm mt02',
                        !initialData.categoryId && 'text-slate-500 italic'
                    )}
                >
                    {selectedOption?.label || 'No Category'}
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 mt-8"
                    >
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ formState, field }) => {
                                return (
                                    <FormItem>
                                        <FormControl>
                                            <Combobox
                                                options={options}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
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

export default CategoryForm
