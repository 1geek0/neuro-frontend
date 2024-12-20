import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type StateParams = {
    state: string;
}

export async function GET(
    request: NextRequest,
     {params} : any
) {
    try {
        const { state } = params

        if (!state) {
            return NextResponse.json(
                { error: 'State parameter is required' },
                { status: 400 }
            )
        }

        const decodedState = decodeURIComponent(state)

        const resources = await prisma.state_medical_resources.findMany({
            where: {
                state: decodedState
            },
            select: {
                id: true,
                name: true,
                state: true,
                facility_type: true,
            },
            orderBy: {
                name: 'asc'
            }
        })
        return NextResponse.json(resources)
    } catch (error) {
        console.error('Error fetching state resources:', error)
        return NextResponse.json(
            { error: 'Failed to fetch state resources' },
            { status: 500 }
        )
    }
} 