import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function processStoryToTimeline(story: string): Promise<any> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Convert this meningioma patient story into a structured timeline JSON format:

Story: ${story}

Format the response as a valid JSON array of events with dates and descriptions.`
      }]
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '[]';
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error processing timeline:', error);
    return []; // Return empty timeline on error
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1536,
      messages: [{
        role: "user",
        content: `Generate a vector embedding for this text. Return only the numeric values as a comma-separated list:

Text: ${text}`
      }]
    });

    const responseText = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    // Convert the comma-separated string to array of numbers
    const embedding = responseText.split(',').map(num => parseFloat(num.trim()));
    
    // Ensure we have exactly 1536 dimensions
    if (embedding.length !== 1536 || embedding.some(isNaN)) {
      throw new Error('Invalid embedding generated');
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return a zero vector as fallback
    return new Array(1536).fill(0);
  }
}

export async function generateTitle(story: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 50,
      messages: [{
        role: "user",
        content: `Given this patient story about meningioma, generate a concise, descriptive title (max 10 words):

Story: ${story}

Generate only the title, nothing else.`
      }]
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';
    return responseText.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    return "My Meningioma Journey"; // Fallback title
  }
}
