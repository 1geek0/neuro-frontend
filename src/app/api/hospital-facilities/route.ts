import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import type { HospitalFacility } from '@prisma/client'

export async function GET(request: NextRequest) {
    try {
        const resourceId = request.nextUrl.searchParams.get('resourceId')
        
        if (!resourceId) {
            return NextResponse.json(
                { error: 'resourceId parameter is required' },
                { status: 400 }
            )
        }

        const facilities = await prisma.hospitalFacility.findMany({
            where: {
                associated_to: {
                    has: resourceId
                }
            }
        })
        
        const transformedFacilities = facilities.map((facility: HospitalFacility) => ({
            id: facility.id,
            name: facility.name,
            link: facility.link
        }))
        
        return NextResponse.json(transformedFacilities)
    } catch (error) {
        console.error('Error fetching hospital facilities:', error)
        return NextResponse.json(
            { error: 'Failed to fetch hospital facilities' },
            { status: 500 }
        )
    }
} 