// src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()
export default prisma

export async function getOrCreateUser(sessionId?: string, auth0Id?: string, username?: string) {
  try {
    if (!sessionId) {
      sessionId = uuidv4()
      console.log('Generated new sessionId:', sessionId)
    }

    // First try to find the user by sessionId or auth0Id
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { sessionId: sessionId },
          ...(auth0Id ? [{ auth0Id: auth0Id }] : [])
        ]
      }
    })

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          sessionId: sessionId,
          auth0Id: auth0Id || null,
          username: username || null
        }
      })
    } else if (auth0Id && !user.auth0Id) {
      // If user exists but doesn't have auth0Id, update them
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          auth0Id,
          username: username || null
        }
      })
    }

    if (!user) {
      throw new Error('Failed to create or retrieve user')
    }

    return { user, sessionId }
  } catch (error) {
    console.error('Error in getOrCreateUser:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

export async function createStory(userId: string, rawText: string, timelineJson: any, embedding: number[]) {
  return prisma.story.create({
    data: {
      userId,
      rawText,
      timelineJson,
      embedding
    }
  })
}

export async function findSimilarStories(embedding: number[], limit: number = 5) {
  try {
    const result = await prisma.$runCommandRaw({
      aggregate: "Story",
      pipeline: [
        {
          $search: {
            index: "stories_vector_index",
            knnBeta: {
              vector: embedding,
              path: "embedding",
              k: limit
            }
          }
        },
        {
          $project: {
            _id: 1,
            createdAt: 1,
            rawText: 1,
            timelineJson: 1,
            score: { $meta: "searchScore" }
          }
        }
      ],
      cursor: {}
    });

    if (!result) {
      return [];
    }

    const typedResult = result as { cursor: { firstBatch: any[] } };

    return typedResult.cursor.firstBatch;
  } catch (error) {
    console.error('Error in findSimilarStories:', error);
    throw error;
  }
}

// export async function findSimilarResearch(embedding: number[], limit: number = 5) {
//   return prisma.$queryRaw`
//     SELECT id, title, url, abstract,
//     embedding <-> float8[${embedding}]::vector AS distance
//     FROM Research
//     ORDER BY distance
//     LIMIT ${limit}
//   `
// }
