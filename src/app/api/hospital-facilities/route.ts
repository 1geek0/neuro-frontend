import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || ""

export async function GET(request: NextRequest) {
    try {
        const resourceId = request.nextUrl.searchParams.get('resourceId')
        
        if (!resourceId) {
            return NextResponse.json(
                { error: 'resourceId parameter is required' },
                { status: 400 }
            )
        }

        const client = new MongoClient(DATABASE_URL)
        await client.connect()
        
        const db = client.db()
        const collection = db.collection('hospital_facilities')
        const facilities = await collection.find({
            associated_to: { $in: [resourceId] }
        }).toArray()
        
        await client.close()
        
        const transformedFacilities = facilities.map(facility => ({
            id: facility._id.toString(),
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