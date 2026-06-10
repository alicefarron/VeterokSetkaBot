import Groq from "groq-sdk";
import { GROQ_API_KEY } from "./config";

const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function generateArticle(
  systemPrompt: string,
  gossipText: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Сплетня: ${gossipText}` },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "Не удалось сгенерировать статью."
  );
}
