// Using Together AI API for open-source models
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, model = 'meta-llama/Llama-2-7b-chat-hf' } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ['</s>', '\n\n'],
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Together AI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response from Together AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      response: data.choices[0].message.content.trim(),
      model: model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Alternative: Using Together AI's completions endpoint for text generation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt');
    const model = searchParams.get('model') || 'meta-llama/Llama-2-7b-chat-hf';
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ['</s>', '\n\n'],
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Together AI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate response from Together AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      response: data.choices[0].text.trim(),
      model: model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}