import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

interface ParamsType {
    params: {
        courseId: string
        chapterId: string
    }
}
export async function PATCH(req: Request, { params }: ParamsType) {
    try {
        const { userId } = auth()
        const { courseId, chapterId } = params

        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId,
            },
        })
        if (!course) return new NextResponse('Unauthorized', { status: 401 })

        const chapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId: courseId,
            },
            data: {
                isPublished: true,
            },
        })

        return NextResponse.json(chapter)
    } catch (error: any) {
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
