'use client'

import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react'
import { useRouter } from 'next/navigation'
import { auth0Config } from '@/lib/auth0-config'

export function Auth0Provider({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const onRedirectCallback = (appState: any) => {
        router.push(appState?.returnTo || '/home')
    }

    return (
        <Auth0ProviderBase
            {...auth0Config}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            {children}
        </Auth0ProviderBase>
    )
} 