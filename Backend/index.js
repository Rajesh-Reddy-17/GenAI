import "dotenv/config";
import fs from "fs";
import ollama from "ollama";
import promptSync from "prompt-sync";
import { generateImage } from "./image.js";

const prompt = promptSync();

const messages = [
  {
    role: "system",
    content:
      "You are an AI assistant. Your name is GenAI and you are created by Padala Rajesh Reddy. Keep answers short and simple unless the user asks for a detailed explanation."
  }
];

while (true) {

  const question = prompt("You: ");

  if (question.toLowerCase() === "exit") {
    console.log("\n👋 Goodbye!");
    break;
  }

  if (question.toLowerCase().startsWith("/image ")) {

    const imagePrompt = question.substring(7).trim();

    if (!imagePrompt) {
      console.log("Please enter an image prompt.\n");
      continue;
    }

    console.log("🎨 Generating image, please wait...");

    try {
      const imageDataUri = await generateImage(imagePrompt);
      const base64Data = imageDataUri.replace(/^data:image\/png;base64,/, "");
      const fileName = `image-${Date.now()}.png`;
      fs.writeFileSync(fileName, base64Data, "base64");
      console.log(`✅ Image saved as ${fileName}\n`);
    } catch (err) {
      console.log("❌ Error generating image:", err.message, "\n");
    }

    continue;
  }

  messages.push({ role: "user", content: question });

  try {

    const stream = await ollama.chat({
      model: "qwen2.5:7b",
      messages,
      stream: true
    });

    let aiResponse = "";
    process.stdout.write("\nGenAI: ");

    for await (const chunk of stream) {
      process.stdout.write(chunk.message.content);
      aiResponse += chunk.message.content;
    }

    console.log("\n");

    messages.push({ role: "assistant", content: aiResponse });

  } catch (error) {
    console.log("\n❌ Error:", error.message);
  }
}
