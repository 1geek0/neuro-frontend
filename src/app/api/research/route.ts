import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
    try {
        const research = await prisma.research.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                url: true,
                abstract: true
            }
        })

        return NextResponse.json(research)
    } catch (error) {
        console.error('Error fetching research:', error)
        return NextResponse.json({ error: 'Failed to fetch research' }, { status: 500 })
    }
} 