import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const DISCOURSE_URL = 'https://neuro86.discourse.group';
const DISCOURSE_SECRET = process.env.DISCOURSE_SECRET;

function base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
}

function base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString();
}

// This endpoint will handle the callback from Discourse with SSO parameters
export async function GET(req: NextRequest) {
    try {
        if (!DISCOURSE_SECRET) {
            return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
        }

        // Get the SSO parameters from the URL
        const url = new URL(req.url);
        const sso = url.searchParams.get('sso');
        const sig = url.searchParams.get('sig');

        if (!sso || !sig) {
            return NextResponse.json({ error: 'Missing SSO parameters' }, { status: 400 });
        }

        // Verify the signature
        const hmac = createHmac('sha256', DISCOURSE_SECRET)
            .update(sso)
            .digest('hex');

        if (hmac !== sig) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Get the nonce from the payload
        const payload = new URLSearchParams(base64Decode(sso));
        const nonce = payload.get('nonce');

        if (!nonce) {
            return NextResponse.json({ error: 'Missing nonce in payload' }, { status: 400 });
        }

        // Redirect to the frontend with SSO parameters
        const redirectUrl = new URL('/home', req.url);
        redirectUrl.searchParams.set('sso', sso);
        redirectUrl.searchParams.set('sig', sig);

        return NextResponse.redirect(redirectUrl);
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

        // Get the SSO parameters from request body
        const { sso, sig } = await req.json();

        if (!sso || !sig) {
            return NextResponse.json({ error: 'Missing SSO parameters' }, { status: 400 });
        }

        // Verify the signature
        const hmac = createHmac('sha256', DISCOURSE_SECRET)
            .update(sso)
            .digest('hex');

        if (hmac !== sig) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Get user info from Auth0
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ 
                error: 'User not authenticated',
                missingHeader: 'authorization'
            }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        
        const userInfoResponse = await fetch('https://dev-yh7epi8p8mkinedt.us.auth0.com/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userInfoResponse.ok) {
            console.error('Failed to fetch user info:', await userInfoResponse.text());
            return NextResponse.json({ 
                error: 'Failed to fetch user info',
                status: userInfoResponse.status
            }, { status: 400 });
        }

        const auth0User = await userInfoResponse.json();

        // Get the nonce from the original SSO request
        const originalPayload = new URLSearchParams(base64Decode(sso));
        const nonce = originalPayload.get('nonce');

        if (!nonce) {
            return NextResponse.json({ error: 'Missing nonce in payload' }, { status: 400 });
        }

        // Create the SSO payload with user data
        const payload = {
            nonce,
            external_id: auth0User.sub,
            email: auth0User.email,
            username: auth0User.nickname || auth0User.name || auth0User.email.split('@')[0],
            name: auth0User.name || auth0User.email,
            require_activation: 'false',
            avatar_url: auth0User.picture,
            avatar_force_update: 'true'
        };

        // Convert payload to query string and encode
        const payloadString = new URLSearchParams(payload).toString();
        const newSso = base64Encode(payloadString);
        
        // Sign the payload
        const newSig = createHmac('sha256', DISCOURSE_SECRET)
            .update(newSso)
            .digest('hex');

        // Return the full Discourse SSO login URL
        return NextResponse.json({ 
            ssoUrl: `${DISCOURSE_URL}/session/sso_login?sso=${encodeURIComponent(newSso)}&sig=${newSig}` 
        });
    } catch (error) {
        console.error('Error in SSO handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
