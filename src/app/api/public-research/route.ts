import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const research = await prisma.patient_relevant_resources.findMany({
            where: {
                resource_type: 'Medical Research' // Filter for medical research
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // Increased to 10 for more variety
            select: {
                id: true,
                title: true,
                link: true,
                content: true,
                resource_type: true
            }
        })

        return NextResponse.json(research)
    } catch (error) {
        console.error('Error fetching public research:', error)
        return NextResponse.json({ 
            error: 'Failed to fetch research resources', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 })
    }
}

// Explicitly disable caching for this endpoint
export const dynamic = 'force-dynamic'
