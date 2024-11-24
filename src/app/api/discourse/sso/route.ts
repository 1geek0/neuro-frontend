import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const DISCOURSE_URL = 'https://neuro86.discourse.group';
const DISCOURSE_SECRET = process.env.DISCOURSE_SECRET;
const DISCOURSE_SSO_LOGIN = `${DISCOURSE_URL}/session/sso_login`;

interface SSOPayload {
    nonce: string;
    email: string;
    external_id: string;
    username?: string;
    name?: string;
    require_activation?: string;
}

function base64Encode(str: string): string {
    return Buffer.from(str).toString('base64');
}

function base64Decode(str: string): string {
    return Buffer.from(str, 'base64').toString();
}

// This is called by your frontend to initiate SSO
export async function POST(req: NextRequest) {
    try {
        console.log('Starting SSO POST request');
        
        if (!DISCOURSE_SECRET) {
            console.error('DISCOURSE_SECRET is not defined');
            return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
        }
        console.log('DISCOURSE_SECRET is defined');

        const body = await req.json();
        console.log('Request body:', body);

        const { userId } = body;

        if (!userId) {
            console.error('Missing required field:', { userId });
            return NextResponse.json({ 
                error: 'User ID is required',
                received: { userId }
            }, { status: 400 });
        }

        // Get Auth0 user data from request headers
        const headers = Object.fromEntries(req.headers.entries());
        console.log('Request headers:', headers);

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            console.error('Missing or invalid authorization header');
            return NextResponse.json({ 
                error: 'User not authenticated',
                missingHeader: 'authorization'
            }, { status: 401 });
        }

        // Get token from Authorization header
        const token = authHeader.split(' ')[1];
        
        // Fetch user info from Auth0
        try {
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
            console.log('Auth0 user info:', auth0User);

            // Force email_verified to true
            auth0User.email_verified = true;

            if (!auth0User.email) {
                console.error('Email not found in user info');
                return NextResponse.json({ 
                    error: 'Email not found in user info',
                    userInfo: auth0User
                }, { status: 400 });
            }

            // Create initial SSO payload
            const ssoPayload = {
                external_id: auth0User.sub,
                email: auth0User.email,
                username: auth0User.nickname || auth0User.name || auth0User.email.split('@')[0],
                name: auth0User.name,
                require_activation: 'false'  // Set to false to skip activation
            };
            console.log('Created SSO payload:', ssoPayload);

            const ssoString = new URLSearchParams(ssoPayload as any).toString();
            const encodedPayload = base64Encode(ssoString);
            const signature = createHmac('sha256', DISCOURSE_SECRET).update(encodedPayload).digest('hex');

            const ssoUrl = `${DISCOURSE_URL}/session/sso_provider?sso=${encodeURIComponent(encodedPayload)}&sig=${signature}`;
            console.log('Generated SSO URL:', ssoUrl);

            return NextResponse.json({ ssoUrl });
        } catch (error) {
            console.error('Error fetching user info:', error);
            return NextResponse.json({ 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in SSO POST handler:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// This is called by Discourse to authenticate the user
export async function GET(req: NextRequest) {
    if (!DISCOURSE_SECRET) {
        return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const payload = searchParams.get('sso');
    const sig = searchParams.get('sig');

    if (!payload || !sig) {
        return NextResponse.json({ error: 'Missing SSO parameters' }, { status: 400 });
    }

    // Verify signature
    const hmac = createHmac('sha256', DISCOURSE_SECRET);
    hmac.update(payload);
    const computedSig = hmac.digest('hex');

    if (computedSig !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Decode the payload
    const decodedParams = new URLSearchParams(base64Decode(payload));
    const nonce = decodedParams.get('nonce');
    const returnSsoUrl = decodedParams.get('return_sso_url');

    if (!nonce || !returnSsoUrl) {
        return NextResponse.json({ error: 'Invalid payload parameters' }, { status: 400 });
    }

    // Get Auth0 user data from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ 
            error: 'User not authenticated',
            missingHeader: 'authorization'
        }, { status: 401 });
    }

    // Get token from Authorization header
    const token = authHeader.split(' ')[1];
        
    // Fetch user info from Auth0
    try {
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
        console.log('Auth0 user info:', auth0User);

        // Force email_verified to true
        auth0User.email_verified = 'true';

        if (!auth0User.email) {
            console.error('Email not found in user info');
            return NextResponse.json({ 
                error: 'Email not found in user info',
                userInfo: auth0User
            }, { status: 400 });
        }

        // Create response payload with Auth0 user data
        const responsePayload: SSOPayload = {
            nonce,
            email: auth0User.email,
            external_id: auth0User.sub,
            username: auth0User.nickname || auth0User.name || auth0User.email.split('@')[0],
            name: auth0User.name,
            require_activation: 'false'  // Set to false to skip activation
        };

        // Convert payload to query string
        const queryString = new URLSearchParams(responsePayload as any).toString();
        
        // Base64 encode the query string
        const encodedPayload = base64Encode(queryString);
        
        // Sign the payload
        const responseHmac = createHmac('sha256', DISCOURSE_SECRET);
        responseHmac.update(encodedPayload);
        const responseSig = responseHmac.digest('hex');

        // Construct the return URL
        const returnUrl = `${returnSsoUrl}?sso=${encodeURIComponent(encodedPayload)}&sig=${responseSig}`;

        return NextResponse.redirect(returnUrl);
    } catch (error) {
        console.error('Error fetching user info:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
