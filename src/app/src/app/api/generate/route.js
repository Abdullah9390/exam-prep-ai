import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return Response.json(
        { error: "Please provide more study material (at least 50 characters)." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert exam preparation assistant. When given study material, you generate a comprehensive exam preparation kit. Always respond with valid JSON only — no markdown, no preamble, no code fences.

Return this exact JSON shape:
{
  "summary": "A clear, concise 3-5 paragraph summary of the material",
  "flashcards": [
    { "id": 1, "question": "...", "answer": "..." }
  ],
  "mcq": [
    {
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0
    }
  ],
  "shortAnswers": [
    { "id": 1, "question": "...", "answer": "..." }
  ],
  "keyTopics": [
    { "topic": "...", "importance": "high|medium|low", "description": "..." }
  ],
  "definitions": [
    { "term": "...", "definition": "..." }
  ]
}

Generate at least 8 flashcards, 6 MCQs, 5 short answer questions, 6 key topics, and 5 definitions. Make everything exam-focused and educationally valuable.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the study material to convert into an exam prep kit:\n\n${text.slice(0, 8000)}`,
        },
      ],
    });

    const raw = message.content.map((b) => b.text || "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const kit = JSON.parse(clean);

    return Response.json(kit);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Failed to generate exam kit. Please try again." },
      { status: 500 }
    );
  }
}
