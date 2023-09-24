import { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { FC } from 'react'

const backgroundVariants = cva(
    'rounded-full flex items-center justify-center',
    {
        variants: {
            variant: {
                default: 'bg-sky-100',
                success: 'bg-emerald-100',
            },
            size: {
                default: 'p-2',
                sm: 'p-1',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

const iconVariants = cva('', {
    variants: {
        variant: {
            default: 'text-sky-700',
            success: 'text-emerald-700',
        },
        size: {
            default: 'h-8 w-8',
            sm: 'h-4 w-4',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

type BackgroundVariantProps = VariantProps<typeof backgroundVariants>
type IconVariantProps = VariantProps<typeof iconVariants>

interface IconBadgeProps extends BackgroundVariantProps, IconVariantProps {
    icon: LucideIcon
}

const IconBadge: FC<IconBadgeProps> = ({ icon: Icon, variant, size }) => {
    return (
        <div className={cn(backgroundVariants({ size, variant }))}>
            <Icon className={cn(iconVariants({ size, variant }))} />
        </div>
    )
}

export default IconBadge