import { jwtVerify, createRemoteJWKSet } from 'jose'

const JWKS = createRemoteJWKSet(
    new URL(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/.well-known/jwks.json`)
)

export async function verifyAuth0Token(token: string) {
    try {
        const verified = await jwtVerify(token, JWKS, {
            issuer: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/`,
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
        })

        if (!verified.payload.sub) {
            throw new Error('Invalid token payload')
        }

        return verified.payload
    } catch (error) {
        console.error('Token verification failed:', error)
        throw new Error('Invalid token')
    }
} 