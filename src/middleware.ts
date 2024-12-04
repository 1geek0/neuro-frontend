import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth0Token } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    if (!request.url.includes('/api/') || request.url.includes('/api/auth/')) {
        return NextResponse.next()
    }

    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify access token
        const token = authHeader.split(' ')[1]
        await verifyAuth0Token(token) // Just verify the token is valid

        // Get user info from the ID token header
        const idToken = request.headers.get('x-id-token')
        if (!idToken) {
            return NextResponse.json(
                { error: 'ID Token required' },
                { status: 401 }
            )
        }

        // Decode ID token (it's already verified by Auth0 SDK)
        const [, payload] = idToken.split('.')
        const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString())

        // Add user info to request headers
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-auth-user-id', decodedPayload.sub)
        requestHeaders.set('x-auth-username', decodedPayload.nickname || decodedPayload.name || '')

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.error('Auth middleware error:', error)
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }
}

export const config = {
    matcher: [
        '/api/story',
        '/api/stories',
        '/api/stories/:path*',
        '/api/similar-stories',
        '/api/research',
        '/api/check-story',
        '/api/timeline',
        '/api/state-resources/:state*',
        '/api/stories/delete-all'
    ]
}