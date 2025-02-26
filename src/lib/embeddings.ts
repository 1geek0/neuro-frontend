import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const openai_client = new OpenAI()
const anthropic = new Anthropic()
const patientTimeline = {
  patientDetails: {
    id: "Unique_ID", // Unique identifier for the patient (string)
    age: 0, // Patient's age (number)
    sex: "M", // Patient's gender, e.g., "M" or "F" (string)
  },
  events: [
    /*
      This is an array of event objects. Each object represents a specific event in the patient's timeline.
      The `day` field is dynamically calculated based on the `startDate`.
    */
    {
      phase: "phase_name", // Example: "pre-diagnosis"
      type: "event_type", // Example: "symptom"
      date: "YYYY-MM-DD", // Example: "2024-01-15"
      dayFromStart: 0, // Day relative to the first event (calculated automatically)
      description: "Detailed description of the event", // Example: "Patient experienced persistent headaches"
      symptoms: ["Symptom1", "Symptom2"], // Example for symptom events
      drugName: "Optional drug name", // Example for medication events
      testType: "Optional test type", // Example for test events
      outcome: "Optional outcome", // Example for follow-up or result events

    },
    {
      phase: "diagnosis",
      type: "test",
      date: "YYYY-MM-DD",
      dayFromStart: 5, // Example of a calculated day relative to startDate
      description: "MRI scan performed to investigate symptoms",
      testType: "MRI",
      outcome: "Lesion detected in brain",

    },
  ],
};



// const sampleTimeline = {
//   "patient_details": {
//     "id": "MNG_2024_001",
//     "age": 45,
//     "sex": "F"
//   },
//   "events": [
//     {
//       "phase": "pre-diagnosis",
//       "type": "symptom",
//       "date": "2024-01-15",
//       "desc": "Persistent headaches and blurred vision"
//     },
//     {
//       "phase": "pre-diagnosis",
//       "type": "medication",
//       "date": "2024-01-15",
//       "end_date": "2024-02-15",
//       "drug_name": "Sumatriptan",
//       "drug_type": "Antimigraine",
//       "linked_symptoms": ["Headache"]
//     },
//     {
//       "phase": "diagnosis",
//       "type": "test",
//       "date": "2024-02-20",
//       "test_type": "MRI",
//       "specific_test": "MRI with Contrast",
//       "location": "Massachusetts General Hospital"
//     },
//     {
//       "phase": "diagnosis",
//       "type": "diagnosis",
//       "date": "2024-02-22",
//       "meningioma_grade": "WHO Grade 1",
//       "specific_type": "Fibrous Meningioma",
//       "linked_specific_tests": ["MRI with Contrast"]
//     },
//     {
//       "phase": "pre-surgery",
//       "type": "monitoring",
//       "date": "2024-03-01",
//       "desc": "Regular monitoring of tumor size and symptoms",
//       "frequency": "Monthly"
//     },
//     {
//       "phase": "pre-surgery",
//       "type": "experience",
//       "date": "2024-03-15",
//       "desc": "Anxiety about upcoming surgery"
//     },
//     {
//       "phase": "surgery",
//       "type": "surgery",
//       "date": "2024-04-01",
//       "treated_by": "Dr. Sarah Johnson",
//       "surgery_type": "Endoscopic Resection",
//       "surgery_site": "Skull Base",
//       "surgery_location": "Brigham and Women's Hospital"
//     },
//     {
//       "phase": "post-surgery",
//       "type": "follow-up",
//       "date": "2024-04-15",
//       "desc": "Post-surgical evaluation",
//       "outcome": "Good recovery, no complications"
//     },
//     {
//       "phase": "post-surgery",
//       "type": "regrowth",
//       "date": "2024-06-01",
//       "desc": "Small regrowth detected in follow-up MRI",
//       "size": "5mm",
//       "location": "Original tumor site"
//     }
//   ]
// }


export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai_client.embeddings.create(({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    }))

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

export async function processStoryToTimeline(text: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      temperature: 0.2,
      system: `I am a helpful assistant that converts patient stories into structured timeline JSON format with this reference format:
      \n\n${JSON.stringify(patientTimeline, null, 2)}
      `,
      messages: [
        {
          role: "user",
          content: [
            {
              "type": "text",
              "text": "<examples>\n<example>\n<patient_story>\nHello Fellow warriors, haven't posted much since my cranioplasty in August. I was focussing on my recovery and building up some physical strength. Thankful my recovery is going good so a far and I just started driving short distances after almost 6 months. It feels good to be able to drop off my son to school and the smile on his face every morning melts my heart.\nAll the surgeries in last 6 months have left me some after affects just like evryone else. One of the after affects I am trying to overcome is insomnia and bodyache specifically my feet and hands. My feet and hands hurt even when I don’t walk much or do much and the pain feels as if joints/bones are hurting. My toes hurt even when I roll them.\n\nJust wanted to know if anyone else experienced bone/joint pain in their feet and hands and if they got any diagnosis/ treatment for that.\n</patient_story>\n<ideal_output>\n{\n  \"patient_details\": {\n    \"id\": \"MNG_2023_007\",\n    \"age\": null,\n    \"sex\": \"F\"  // Inferred from context of being a mother\n  },\n  \"events\": [\n    {\n      \"phase\": \"surgery\",\n      \"type\": \"surgery\",\n      \"date\": \"2023-08-15\",  // Assuming mid-August\n      \"surgery_type\": \"Craniotomy\",\n      \"surgery_site\": \"Skull\",\n      \"desc\": \"Cranioplasty procedure\"\n    },\n    {\n      \"phase\": \"post-surgery\",\n      \"type\": \"symptom\",\n      \"date\": \"2023-08-20\",\n      \"desc\": [\n        \"Insomnia\",\n        \"Body ache\",\n        \"Joint pain in feet and hands\",\n        \"Toe pain\"\n      ],\n      \"severity\": \"Moderate\",\n      \"duration\": \"Ongoing\",\n      \"location\": \"Extremities\"\n    },\n    {\n      \"phase\": \"post-surgery\",\n      \"type\": \"follow-up\",\n      \"date\": \"2024-02-15\",  // Approximately 6 months post-surgery\n      \"desc\": \"Return to driving\",\n      \"outcome\": \"Able to drive short distances\",\n      \"duration\": \"After 6 months of restriction\"\n    }\n  ]\n}\n</ideal_output>\n</example>\n</examples>\n\n"
            },
            {
              "type": "text",
              "text": `Patient story: ${text}`
            }
          ]
        }]
    })

    const responseText: string = response.content[0].type === 'text'
      ? response.content[0].text
      : '';
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    const jsonStr = jsonStart >= 0 && jsonEnd >= 0 ? responseText.slice(jsonStart, jsonEnd + 1) : '{}';
    // console.log("Timeline Json == >" , jsonStr)
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error processing story:', error)
    throw new Error('Failed to process story')
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
