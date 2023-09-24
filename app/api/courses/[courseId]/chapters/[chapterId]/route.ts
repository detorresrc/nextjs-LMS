import Mux from '@mux/mux-node'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { utapi } from 'uploadthing/server'

import { db } from '@/lib/db'

const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!
)

interface ParamsType {
    params: {
        courseId: string
        chapterId: string
    }
}
export async function PATCH(req: Request, { params }: ParamsType) {
    try {
        const { userId } = auth()
        const { isPublished, ...values } = await req.json()
        const { courseId } = params

        if (!userId) return new NextResponse('Unauthorized', { status: 401 })

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId,
            },
        })
        if (!course) return new NextResponse('Unauthorized', { status: 401 })

        const updatedChapter = await db.chapter.update({
            where: {
                id: params.chapterId,
                courseId: courseId,
            },
            data: {
                ...values,
            },
        })

        if (values.videoUrl) {
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId: params.chapterId,
                },
            })

            if (existingMuxData) {
                await Video.Assets.del(existingMuxData.assetId)
                await db.muxData.delete({
                    where: {
                        id: existingMuxData.id,
                    },
                })
            }

            const asset = await Video.Assets.create({
                input: values.videoUrl,
                playback_policy: 'public',
                test: false,
            })

            await db.muxData.create({
                data: {
                    assetId: asset.id,
                    chapterId: params.chapterId,
                    playbackId: asset.playback_ids?.[0]?.id || '',
                },
            })
        }

        return NextResponse.json(updatedChapter)
    } catch (error: any) {
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: ParamsType) {
    const { userId } = auth()
    const { courseId, chapterId } = params

    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    try {
        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        })

        if (!ownCourse) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Delete Chapter
        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: params.courseId,
            },
        })

        if (!chapter) {
            return new NextResponse('Not Found', { status: 404 })
        }

        if (chapter.videoUrl) {
            // Delete Mux Data
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId: chapterId,
                },
            })
            if (existingMuxData) {
                await Video.Assets.del(existingMuxData.assetId)
                await db.muxData.delete({
                    where: {
                        id: existingMuxData.id,
                    },
                })
            }

            // Delete File from Uploadthing
            const key = chapter.videoUrl.split('/').pop() || ''
            if (key) await utapi.deleteFiles(key)
        }

        await db.chapter.delete({
            where: {
                id: chapter.id,
            },
        })

        await db.chapter.updateMany({
            where: {
                courseId: chapter.courseId,
                position: {
                    gt: chapter.position,
                },
            },
            data: {
                position: {
                    decrement: 1,
                },
            },
        })

        return NextResponse.json(chapter)
    } catch (error: any) {
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
