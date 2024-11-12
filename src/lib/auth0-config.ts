if (!process.env.NEXT_PUBLIC_AUTH0_DOMAIN) {
    throw new Error('Missing NEXT_PUBLIC_AUTH0_DOMAIN')
}

if (!process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID) {
    throw new Error('Missing NEXT_PUBLIC_AUTH0_CLIENT_ID')
}

export const auth0Config = {
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
    authorizationParams: {
        redirect_uri: typeof window === 'undefined'
            ? process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI
            : `${window.location.origin}/home`,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email',
    },
} 