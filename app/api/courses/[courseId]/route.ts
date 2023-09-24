import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import Mux from '@mux/mux-node'
import { utapi } from 'uploadthing/server'

const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!
)

interface ParamsType {
    params: {
        courseId: string
    }
}
export async function PATCH(req: Request, { params }: ParamsType) {
    try {
        const { userId } = auth()
        const values = await req.json()
        const { courseId } = params

        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const updatedCourse = await db.course.update({
            where: {
                id: courseId,
            },
            data: {
                ...values,
            },
        })

        revalidatePath(`/teacher/courses/${courseId}`)

        return new NextResponse(JSON.stringify(updatedCourse), { status: 200 })
    } catch (error: any) {
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth()

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            },
            include: {
                chapters: {
                    include: {
                        muxData: true,
                    },
                },
            },
        })

        if (!course) {
            return new NextResponse('Not found', { status: 404 })
        }

        try {
            for (const chapter of course.chapters) {
                if (chapter.muxData?.assetId) {
                    await Video.Assets.del(chapter.muxData.assetId)
                }

                const key = chapter?.videoUrl?.split('/').pop() || ''
                if (key) await utapi.deleteFiles(key)
            }

            const key = course.imageUrl?.split('/').pop() || ''
            if (key) await utapi.deleteFiles(key)
        } catch (error) {
            console.log(error)
        }

        const deletedCourse = await db.course.delete({
            where: {
                id: params.courseId,
            },
        })

        return NextResponse.json(deletedCourse)
    } catch (error) {
        console.log('[COURSE_ID_DELETE]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
