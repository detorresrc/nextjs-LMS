import { FC } from 'react'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import IconBadge from '@/components/icon-badge'
import {
    CircleDollarSign,
    LayoutDashboard,
    ListChecks,
    File,
} from 'lucide-react'

import TitleForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/title-form'
import DescriptionForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/description-form'
import ImageForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/image-form'
import CategoryForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/category-form'
import PriceForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/price-form'
import AttachmentsForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/attachments-form'
import ChaptersForm from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/chapters-form'
import { Banner } from '@/components/banner'
import { Actions } from './_components/actions'

interface CoursePageProps {
    params: {
        courseId: string
    }
}

const CoursePage: FC<CoursePageProps> = async ({ params }) => {
    const { userId } = auth()
    const course = await db.course.findUnique({
        where: {
            id: params.courseId,
            userId: userId || '',
        },
        include: {
            attachments: {
                orderBy: {
                    createdAt: 'desc',
                },
            },
            chapters: {
                orderBy: {
                    position: 'asc',
                },
            },
        },
    })
    if (!course) {
        return redirect('/')
    }
    const categories = await db.category.findMany({
        orderBy: {
            name: 'asc',
        },
    })

    if (!course) redirect('/')

    const requiredFields = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        course.categoryId,
        course.chapters.some((chapter) => chapter.isPublished),
    ]

    const totalFields = requiredFields.length
    const completedFields = requiredFields.filter(Boolean).length
    const completionText = `(${completedFields}/${totalFields})`
    const isComplete = requiredFields.every(Boolean)

    return (
        <>
            {!course.isPublished && (
                <Banner label="This course is unpublished. It will not be visible to the students." />
            )}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-2">
                        <h1 className="text-2xl font-medium">Course Setup</h1>
                        <span className="text-sm text-slate-700">
                            Complete all fields {completionText}
                        </span>
                    </div>
                    <Actions
                        disabled={!isComplete}
                        courseId={params.courseId}
                        isPublished={course.isPublished}
                    />
                </div>

                <div className="w-full flex flex-col md:flex-row justify-stretch gap-6 mt-16">
                    <div className="flex-1 w-full md:w-1/2">
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2>Customize your course</h2>
                        </div>

                        <TitleForm initialData={course} courseId={course.id} />
                        <DescriptionForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <ImageForm initialData={course} courseId={course.id} />
                        <CategoryForm
                            initialData={course}
                            courseId={course.id}
                            options={categories.map((category) => ({
                                label: category.name,
                                value: category.id,
                            }))}
                        />
                    </div>
                    <div className="space-y-6 w-full md:w-1/2">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={ListChecks} />
                                <h2 className="text-xl">Course Chapter</h2>
                            </div>
                            <div>
                                <ChaptersForm
                                    initialData={course}
                                    courseId={course.id}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={CircleDollarSign} />
                                <h2 className="text-xl">Sell your course</h2>
                            </div>
                            <PriceForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={File} />
                                <h2 className="text-xl">
                                    Resources & Attachments
                                </h2>
                            </div>
                            <div>
                                <AttachmentsForm
                                    initialData={course}
                                    courseId={course.id}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CoursePage
