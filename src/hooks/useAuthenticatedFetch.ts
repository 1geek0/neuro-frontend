import { useAuth0 } from '@auth0/auth0-react'

export function useAuthenticatedFetch() {
    const { getAccessTokenSilently, getIdTokenClaims } = useAuth0()

    return async (url: string, options: RequestInit = {}) => {
        try {
            const [accessToken, idTokenClaims] = await Promise.all([
                getAccessTokenSilently(),
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
            throw error
        }
    }
} 