// index.mjs
import { NextResponse } from 'next/server';
import { loadModel } from '@fugood/llama.node';
import path from 'path';

const MODEL_PATH = process.env.LLAMA_MODEL_PATH || './models/llama-2-7b-chat.gguf';

let context: Awaited<ReturnType<typeof loadModel>> | null = null;

async function initModel() {
  if (!context) {
    try {
      context = await loadModel({
        model: MODEL_PATH,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1, // Enable GPU acceleration if available
      });
    } catch (error) {
      console.error('Failed to initialize Llama model:', error);
      throw new Error('Failed to initialize AI model');
    }
  }
  return context;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    const model = await initModel();
        
    const { text } = await model.completion({
      prompt,
      n_predict: 2048,
      stop: ['</s>', '\n\n'],
    });
    
    return NextResponse.json({ 
      response: text 
    });
   
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}