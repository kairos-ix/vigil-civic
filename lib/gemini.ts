import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

export interface ClassificationResult {
  category: string
  severity: string
  confidence: number
  title: string
  description: string
  issueDetected: boolean
  suggestedTags: string[]
}

export async function classifyIssueImage(
  imageBase64: string,
  mimeType = 'image/jpeg'
): Promise<ClassificationResult> {
  const prompt = `Analyze this image for a civic issue reporting app in India.
Return ONLY valid JSON, no markdown, no backticks:
{"category":"pothole|water_leakage|streetlight|waste|road_damage|drainage|other","severity":"low|medium|high|critical","confidence":0.0-1.0,"title":"5-8 word title","description":"2-3 sentence description for authorities","issueDetected":true|false,"suggestedTags":["tag1","tag2"]}
If no civic issue visible: issueDetected:false, category:"other", severity:"low"`

  try {
    const result = await geminiFlash.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: imageBase64 } },
    ])
    const text = result.response
      .text()
      .trim()
      .replace(/```json|```/g, '')
      .trim()
    return JSON.parse(text)
  } catch {
    return {
      category: 'other',
      severity: 'low',
      confidence: 0,
      title: 'Civic Issue Reported',
      description: 'Issue requires manual review.',
      issueDetected: true,
      suggestedTags: [],
    }
  }
}

export async function generateAreaInsight(
  category: string,
  count: number,
  area: string
): Promise<string> {
  try {
    const result = await geminiFlash.generateContent(
      `You are a civic analyst. Write 1-2 sentences of actionable insight for municipal authorities about: ${count} ${category.replace('_', ' ')} issues near ${area}. Plain text only.`
    )
    return result.response.text().trim()
  } catch {
    return `${count} ${category.replace('_', ' ')} issues detected in this area. Immediate inspection recommended.`
  }
}
