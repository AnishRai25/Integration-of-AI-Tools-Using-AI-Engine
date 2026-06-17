// A service layer to switch between mock data and real Ollama/API endpoints
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

const OLLAMA_BASE_URL = '/api/generate';

/**
 * Fetches a response from a local Ollama instance
 */
export const fetchOllama = async (model, prompt, signal) => {
  try {
    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        keep_alive: 0
      }),
      signal
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama natively rejected the request. Status: ${response.status}. Log: ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    if (error.name === 'AbortError') {
      return `(Timeout) The query to ${model} took too long and was safely aborted.`;
    }
    console.error(`Diagnostic Error fetching from Ollama (${model}):`, error);
    return `(Error ${model}) Local host failed to process payload.\n\n[Diagnostic Trace: ${error.message}]`;
  }
};

/**
 * Main query distributor.
 */
export const distributeQuery = async (query, useMock = false, signal, onStatusUpdate = () => {}) => {
  if (useMock) {
    return {
      model1: new Promise(resolve => setTimeout(() => resolve(`(Mock Llama) Response to: "${query}". highly analytical...`), 1500)),
      model2: new Promise(resolve => setTimeout(() => resolve(`(Mock Moondream) Analyzing vision and text arrays for: "${query}". extracting metadata...`), 2000)),
      model3: new Promise(resolve => setTimeout(() => resolve(`(Mock DeepSeek) Straight answer about: "${query}". unfiltered...`), 1200)),
      model4: new Promise(resolve => setTimeout(() => resolve(`(Mock Qwen) Structured response for: "${query}". key points...`), 1800)),
    };
  } else {
    // Reverting to the authentic native model mappings
    // Executing requests STRICTLY sequentially to mathematically prevent VRAM thrashing and guarantee all 4 models run gracefully.
    const p1 = fetchOllama('llama3', query, signal);
    
    const p2 = p1.then(() => {
        onStatusUpdate('model2', '*(System)* Local Node 1 freed! Booting Mistral into VRAM...');
        return fetchOllama('mistral', query, signal);
    });
    
    const p3 = p2.then(() => {
        onStatusUpdate('model3', '*(System)* Local Node 2 freed! Booting DeepSeek into VRAM...');
        return fetchOllama('deepseek-r1', query, signal);
    });
    
    const p4 = p3.then(() => {
        onStatusUpdate('model4', '*(System)* Local Node 3 freed! Booting Qwen into VRAM...');
        return fetchOllama('qwen', query, signal);
    });

    return {
      model1: p1,
      model2: p2,
      model3: p3, 
      model4: p4,
    };
  }
};

export const synthesizeResults = async (resultsArray, useMock = false, signal) => {
    if (useMock) {
        return new Promise(resolve => setTimeout(() => {
            resolve("Synthesized Mock Result: Combine the best attributes from all 4 models into one cohesive answer.");
        }, 3500));
    } else {
        // Optimizing RAM: Use the active verified engine for synthesis.
        const synthesisPrompt = `You are an expert, highly intelligent AI synthesizer.
Your task is to review the following 4 responses from different AI models and combine them into a single, masterful, beautifully optimized, and highly accurate final consensus response.

Instructions:
1. Extract the most valuable and factually correct insights from each response.
2. Remove redundancies and contradictions.
3. Keep the answer highly structured, using Markdown formatting (bolding, lists) to make it easy to read.
4. Provide the BEST POSSIBLE DIRECT ANSWER. Do NOT mention that you are synthesizing from multiple models. Just act as the ultimate authority.

--- Model Responses ---
${resultsArray.map((r, i) => `[Response ${i+1}]\n${r}`).join('\n\n')}
-----------------------`;
        return fetchOllama('llama3', synthesisPrompt, signal);
    }
}

/**
 * Image to Text Vision Processor
 */
export const processImageToText = async (base64Image, signal) => {
  // Removed strict timeout: User hardware requires 10-15 minutes for project presentation rendering.
  try {
     const response = await fetch(OLLAMA_BASE_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         model: 'moondream', // The default Ollama vision model
         prompt: 'Provide a detailed and comprehensive descriptive analysis of everything visible in this image. Describe the scene, objects, people, colors, and any actions taking place. Do not focus solely on extracting text; provide a full visual description.',
         images: [base64Image.includes(',') ? base64Image.split(',')[1] : base64Image],
         stream: false,
         keep_alive: 0
       }),
       signal // Standard inherited signal, explicitly avoiding hard timeouts
     });

     if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Vision model failed natively. Status: ${response.status}. Log: ${errorText}`);
     }
     
     const data = await response.json();
     return data.response;
  } catch (err) {
      console.error('Vision API Diagnostics:', err);
      return `*(OCR System Diagnostic)*\nThe Vision processor encountered an unexpected error locally processing this payload via Ollama.\n\n[Trace Code: ${err.message}]`;
  }
}

let ascPipeline = null;
let asrPipeline = null;

/**
 * Audio to Text Processor (Real Offline Transformers.js Model)
 */
export const processAudioToText = async (base64Audio, signal, onProgress = () => {}) => {
  try {
    onProgress('Decoding audio data structure...');
    const response = await fetch(base64Audio);
    const arrayBuffer = await response.arrayBuffer();
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContent.decodeAudioData(arrayBuffer);
    const audioData = audioBuffer.getChannelData(0);

    onProgress('Booting Audio Classification Tensor (AST)...');
    if (!ascPipeline) {
        ascPipeline = await pipeline('audio-classification', 'Xenova/ast-finetuned-audioset-10-10-0.4593');
    }

    onProgress('Booting Speech Transcription Tensor (Whisper)...');
    if (!asrPipeline) {
        asrPipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    }

    onProgress('Analyzing Audio Elements...');
    const ascResult = await ascPipeline(audioData);
    const topElements = ascResult.filter(r => r.score > 0.02).map(r => r.label).join(', ') || 'Unidentified Ambient Noise';

    onProgress('Transcribing Speech Components...');
    const asrResult = await asrPipeline(audioData);
    const transcript = asrResult.text.trim();

    return `*(VAAA Local Analysis)*\n\n[Detected Elements]:\n${topElements}\n\n[Transcript]:\n${transcript ? transcript : '(No recognizable speech detected in this audio log)'}`;
  } catch (err) {
      console.error('Local Audio Analytics Diagnostic:', err);
      return `*(Audio System Diagnostic)*\nThe Local Audio Engine encountered a decoding or tensor inference error in the browser.\n\n[Trace Code: ${err.message}]`;
  }
}
