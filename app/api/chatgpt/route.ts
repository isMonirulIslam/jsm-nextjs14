import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { question } = await request.json();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that answers questions based on the provided context.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
};
