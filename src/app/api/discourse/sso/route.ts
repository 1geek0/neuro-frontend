import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const DISCOURSE_URL = 'https://neuro86.discourse.group';
const DISCOURSE_SECRET = process.env.DISCOURSE_SECRET;

function base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
}

// This is called by your frontend to initiate SSO
export async function POST(req: NextRequest) {
    try {
        if (!DISCOURSE_SECRET) {
            return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
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

        // Create the SSO payload
        const payload = {
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
        const sso = base64Encode(payloadString);
        
        // Sign the payload
        const sig = createHmac('sha256', DISCOURSE_SECRET)
            .update(sso)
            .digest('hex');

        // Return the full Discourse SSO login URL
        return NextResponse.json({ 
            ssoUrl: `${DISCOURSE_URL}/session/sso_login?sso=${encodeURIComponent(sso)}&sig=${sig}` 
        });
    } catch (error) {
        console.error('Error in SSO handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
