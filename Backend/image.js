import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function generateImage(prompt) {
  if (!process.env.HF_TOKEN) {
    throw new Error("Missing HF_API_TOKEN in .env file");
  }

  try {
    console.log(`🎨 Generating image for prompt: "${prompt}"...`);

    const imageBlob = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    console.log(`✅ Image generated successfully (${arrayBuffer.byteLength} bytes)`); // ADDED

    return `data:image/png;base64,${base64Image}`;

  } catch (err) {
    console.error("❌ Hugging Face image generation failed:", err);
    throw new Error(err.message || "Hugging Face image generation failed");
  }
}
