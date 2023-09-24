import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { utapi } from 'uploadthing/server'

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; attachmentId: string } }
) {
    try {
        const { userId } = auth()

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: params.courseId,
                userId: userId,
            },
        })

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const attachment = await db.attachment.delete({
            where: {
                id: params.attachmentId,
            },
        })

        await utapi.deleteFiles(attachment.name)

        return NextResponse.json(attachment, { status: 200 })
    } catch (error) {
        return new NextResponse('Internal Error', { status: 500 })
    }
}
