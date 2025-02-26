// src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { processStoryToTimeline } from './embeddings'

const prisma = new PrismaClient()
export default prisma

export async function getOrCreateUser(sessionId?: string, auth0Id?: string, username?: string) {
  try {
    if (!auth0Id) {
      throw new Error('auth0Id is required');
    }

    let user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!user) {
      let newSessionId = sessionId || uuidv4();
      // Ensure the sessionId is unique
      while (await prisma.user.findUnique({ where: { sessionId: newSessionId } })) {
        newSessionId = uuidv4();
      }

      user = await prisma.user.create({
        data: {
          sessionId: newSessionId,
          auth0Id,
          username: username || null
        }
      });
    }

    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    return { user, sessionId: user.sessionId };
  } catch (error) {
    console.error('Error in getOrCreateUser:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function createStory(userId: string, title: string, rawText: string, timelineJson: any, embedding: number[]) {
  return prisma.story.create({
    data: {
      userId,
      title,
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
            index: "default",
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

async function updateTimelines() {
    try {
        const oldStories = await prisma.story.findMany({
            select: {
                id: true,
                rawText: true
            }
        })

        console.log(`Found ${oldStories.length} stories to update.`);


        for (const story of oldStories) {
            const { id, rawText } = story;

            const updatedTimeline = await processStoryToTimeline(rawText);

            await prisma.story.update({
                where: { id },
                data: {
                    timelineJson: updatedTimeline
                }
            })

            console.log(`Updated story ID: ${id}`);
        }

        console.log('All stories updated successfully.');
    }
    catch (error) {
        console.error('Error updating stories:', error);
    }
    finally {
        await prisma.$disconnect();
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
