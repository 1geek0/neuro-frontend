import { useAuth0 } from '@auth0/auth0-react'

export function useAuthenticatedFetch() {
    const { getAccessTokenSilently, getIdTokenClaims, loginWithRedirect } = useAuth0()

    return async (url: string, options: RequestInit = {}) => {
        try {
            const [accessToken, idTokenClaims] = await Promise.all([
                getAccessTokenSilently({
                    authorizationParams: {
                        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
                        scope: 'openid profile email offline_access'
                    }
                }),
                getIdTokenClaims()
            ]);

            if (!idTokenClaims?.__raw) {
                throw new Error('Failed to get ID token')
            }

            const headers = {
                ...options.headers,
                'Authorization': `Bearer ${accessToken}`,
                'x-id-token': idTokenClaims.__raw
            }

            return fetch(url, {
                ...options,
                headers
            })
        } catch (error) {
            console.error('Error in authenticated fetch:', error)
            // If token refresh fails, redirect to login
            if (error instanceof Error && error.message.includes('Missing Refresh Token')) {
                await loginWithRedirect({
                    authorizationParams: {
                        scope: 'openid profile email offline_access'
                    }
                })
            }
            throw error
        }
    }
} 