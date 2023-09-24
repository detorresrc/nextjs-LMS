import { columns } from './_components/columns'
import { DataTable } from './_components/data-table'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

const CoursesPage = async () => {
    const { userId } = auth()
    if (!userId) {
        return redirect('/')
    }

    const courses = await db.course.findMany({
        where: {
            userId: userId || '',
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return (
        <div className="p-6">
            <DataTable columns={columns} data={courses} />
        </div>
    )
}

export default CoursesPage
