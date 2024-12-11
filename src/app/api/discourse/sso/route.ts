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

        // Redirect to Discourse with SSO parameters
        const discourseRedirectUrl = `${DISCOURSE_URL}/session/sso_login?sso=${encodeURIComponent(sso)}&sig=${sig}`;
        console.log('Redirecting to Discourse SSO login:', discourseRedirectUrl);
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
            return NextResponse.json({ error: 'Discourse secret is not defined!' }, { status: 500 });
        }

        // Get user info from Auth0
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ 
                error: 'User not authenticated',
                missingHeader: 'authorization'
            }, { status: 401 });
        }

        // Redirect to Discourse's SSO endpoint to start the process
        return NextResponse.json({ 
            redirectUrl: `${DISCOURSE_URL}/session/sso` 
        });
    } catch (error) {
        console.error('Error in SSO handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
