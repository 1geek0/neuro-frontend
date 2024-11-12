import { useAuth0 } from '@auth0/auth0-react'

export function useAuthenticatedFetch() {
    const { getAccessTokenSilently, getIdTokenClaims } = useAuth0()

    return async (url: string, options: RequestInit = {}) => {
        const [accessToken, idTokenClaims] = await Promise.all([
            getAccessTokenSilently(),
            getIdTokenClaims()
        ]);

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'x-id-token': idTokenClaims.__raw
        }

        return fetch(url, {
            ...options,
            headers
        })
    }
} 