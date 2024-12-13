import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

// Configuration constants
const DISCOURSE_URL = 'https://neuro86.discourse.group';
const FRONTEND_URL = 'https://neuro-frontend-seven.vercel.app';
const DISCOURSE_SECRET = process.env.DISCOURSE_SECRET;
const AUTH0_DOMAIN = 'https://dev-yh7epi8p8mkinedt.us.auth0.com';

// Utility functions
function base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
}

function base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString();
}

function createSignature(payload: string): string {
    if (!DISCOURSE_SECRET) {
        throw new Error('Discourse secret is not configured');
    }
    return createHmac('sha256', DISCOURSE_SECRET)
        .update(payload)
        .digest('hex');
}

async function getUserInfo(token: string) {
    const userInfoResponse = await fetch(`${AUTH0_DOMAIN}/userinfo`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('Failed to fetch user info:', errorText);
        throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
    }

    return userInfoResponse.json();
}

export async function GET(req: NextRequest) {
    try {
        if (!DISCOURSE_SECRET) {
            return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
        }

        const url = new URL(req.url);
        const sso = url.searchParams.get('sso');
        const sig = url.searchParams.get('sig');

        if (!sso || !sig) {
            return NextResponse.json({ error: 'Missing SSO parameters' }, { status: 400 });
        }

        const hmac = createSignature(sso);
        if (hmac !== sig) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        const payload = new URLSearchParams(base64Decode(sso));
        const nonce = payload.get('nonce');

        if (!nonce) {
            return NextResponse.json({ error: 'Missing nonce in payload' }, { status: 400 });
        }

        // Redirect directly to Discourse
        const discourseRedirectUrl = `${DISCOURSE_URL}/session/sso_login?sso=${encodeURIComponent(sso)}&sig=${sig}`;
        return NextResponse.redirect(discourseRedirectUrl);
    } catch (error) {
        console.error('Error in SSO handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!DISCOURSE_SECRET) {
            return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
        }

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ 
                error: 'User not authenticated',
                missingHeader: 'authorization'
            }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const auth0User = await getUserInfo(token);

        // Generate nonce
        const nonce = randomBytes(16).toString('hex');

        // Create user payload
        const userPayload = new URLSearchParams({
            nonce: nonce,
            external_id: auth0User.sub,
            email: auth0User.email,
            username: auth0User.nickname || auth0User.name || auth0User.email.split('@')[0],
            name: auth0User.name || auth0User.email,
            require_activation: 'true',
            avatar_url: auth0User.picture,
            avatar_force_update: 'true',
            return_sso_url: `${FRONTEND_URL}/api/discourse/sso/callback`
        }).toString();

        // Base64 encode and sign
        const sso = base64Encode(userPayload);
        const sig = createSignature(sso);

        // Instead of returning JSON, redirect directly to Discourse
        const discourseUrl = `${DISCOURSE_URL}/session/sso_login?sso=${encodeURIComponent(sso)}&sig=${sig}`;
        return NextResponse.redirect(discourseUrl);

    } catch (error) {
        console.error('Error in SSO handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}