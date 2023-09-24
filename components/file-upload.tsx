'use client'

import { UploadDropzone } from '@/lib/uploadthing'
import { ourFileRouter } from '@/app/api/uploadthing/core'
import { FC } from 'react'
import toast from 'react-hot-toast'

interface FileUploadProps {
    onChange: (url?: string) => void
    endpoint: keyof typeof ourFileRouter
}

const FileUpload: FC<FileUploadProps> = ({ endpoint, onChange }) => {
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url)
            }}
            onUploadError={(error: Error) => {
                toast.error(error.message, {
                    position: 'top-right',
                })
            }}
        ></UploadDropzone>
    )
}

export default FileUpload
