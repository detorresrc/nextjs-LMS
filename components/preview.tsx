'use client'

import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.bubble.css'
import { FC, useMemo } from 'react'

interface PreviewProps {
    value: string
}

const Preview: FC<PreviewProps> = ({ value }) => {
    const ReactQuill = useMemo(
        () => dynamic(() => import('react-quill'), { ssr: false }),
        []
    )

    return (
        <div className="bg-white">
            <ReactQuill theme={'bubble'} value={value} readOnly />
        </div>
    )
}

export default Preview
