import { FC } from 'react'

type AuthLayoutProps = {
    children: React.ReactNode
}
const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className={'h-full flex items-center justify-center'}>
            {children}
        </div>
    )
}

export default AuthLayout
