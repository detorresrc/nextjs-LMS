'use client'

import { FC } from 'react'
import { BarChart, Compass, Layout, List } from 'lucide-react'
import SidebarItem from '@/app/(dashboard)/_components/sidebar-item'
import { usePathname } from 'next/navigation'

const guestRoutes = [
    {
        icon: Layout,
        label: 'Dashboard',
        href: '/',
    },
    {
        icon: Compass,
        label: 'Browse',
        href: '/search',
    },
]

const teacherRoutes = [
    {
        icon: List,
        label: 'Courses',
        href: '/teacher/courses',
    },
    {
        icon: BarChart,
        label: 'Analytics',
        href: '/teacher/analytics',
    },
]

const SidebarRoutes: FC = () => {
    const pathname = usePathname()

    const isTeacherPage = pathname?.startsWith('/teacher')

    const routes = isTeacherPage ? teacherRoutes : guestRoutes

    return (
        <div className="flex flex-col w-full">
            {routes.map((route) => (
                <SidebarItem key={route.label} {...route} />
            ))}
        </div>
    )
}

export default SidebarRoutes
