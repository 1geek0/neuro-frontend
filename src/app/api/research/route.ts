import Airtable from 'airtable';
import { NextRequest, NextResponse } from 'next/server';
import { loadEnvConfig } from '@next/env';
import OpenAI from 'openai/index.mjs';
import prisma from '@/lib/db';

loadEnvConfig(process.cwd());

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Patient Relevant Resources';

if (!apiKey || !baseId) {
    throw new Error('Missing Airtable API key or base ID');
}

const api = new Airtable({ apiKey });
const base = api.base(baseId);

export async function POST(req: NextRequest) {
    try {
        const table = base.table(tableName);
        const records = await table.select({ filterByFormula: "AND({Resource Type} = 'Medical Research')" }).all();

        const researchData = await Promise.all(records.map(async (record) => {
            const fields = record.fields;
            const title = fields.Title;
            const url = fields.Link;
            const content = fields['All text'];

            if (!title || !url) return null;

            const openaiClient = new OpenAI();
            const embeddingResponse = await openaiClient.embeddings.create({
                model: "text-embedding-3-small",
                input: `${title} ${content || ''}`,
                encoding_format: "float"
            });

            return {
                title,
                url,
                content,
                embedding: embeddingResponse.data[0].embedding,
                updatedAt: new Date().toISOString(),
            };
        }));

        return NextResponse.json(researchData.filter(Boolean));
    } catch (error) {
        console.error('Error importing research:', error);
        return NextResponse.json({ error: 'Failed to import research' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const research = await prisma.patient_relevant_resources.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                link: true,
                content: true,
                resource_type: true
            }
        });

        return NextResponse.json(research);
    } catch (error) {
        console.error('Error fetching research:', error);
        return NextResponse.json({ error: 'Failed to fetch research' }, { status: 500 });
    }
} 