import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

interface useRedirectIfNotAuthenticatedProps {
    redirectPath: string
}
const useRedirectIfNotAuthenticated = ({
    redirectPath = '/',
}: useRedirectIfNotAuthenticatedProps) => {
    const { userId } = auth()
    if (!userId) return redirect(redirectPath || '/')
}

export default useRedirectIfNotAuthenticated
