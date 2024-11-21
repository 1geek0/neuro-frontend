import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const DISCOURSE_URL = 'https://neuro86.discourse.group'; // Your Discourse URL
const DISCOURSE_SECRET = process.env.DISCOURSE_SECRET; // Your Discourse SSO secret

export async function POST(req: NextRequest) {
    const { userId, email } = await req.json();

    if (!userId || !email) {
        return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }

    const ssoPayload = {
        nonce: Date.now(),
        email,
        external_id: userId,
    };

    const ssoString = JSON.stringify(ssoPayload);
    console.log(DISCOURSE_SECRET)
    if (!DISCOURSE_SECRET) {
        return NextResponse.json({ error: 'Discourse secret is not defined' }, { status: 500 });
    }

    const signature = createHmac('sha256', DISCOURSE_SECRET).update(ssoString).digest('hex');

    const ssoUrl = `${DISCOURSE_URL}/session/sso_provider?payload=${encodeURIComponent(ssoString)}&sig=${signature}`;

    return NextResponse.json({ ssoUrl });
}