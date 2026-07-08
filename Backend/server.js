import express from "express";
import cors from "cors";
import multer from "multer";
import ollama from "ollama";
import { generateImage } from "./image.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.use(cors());
app.use(express.static("public"));


const MODEL_CONFIG = {
    "qwen2.5:7b":        { type: "text",   ollamaModel: "qwen2.5:7b" },
    "qwen2.5-coder:7b":  { type: "text",   ollamaModel: "qwen2.5-coder:7b" },
    "flux.1-schnell":    { type: "image" },
    "minicpm-v-4.6":     { type: "vision", ollamaModel: "minicpm-v:8b" },
    "deepseek-r1:8b":    { type: "text",   ollamaModel: "deepseek-r1:8b" },
    "dolphin-llama3:8b": { type: "text",   ollamaModel: "dolphin-llama3:8b" },
    "translategemma:4b": { type: "text",   ollamaModel: "translategemma:4b" }
};

const DEFAULT_MODEL = "qwen2.5:7b";

const KEEP_ALIVE = "30m";

const MAX_HISTORY_MESSAGES = 12;

const messagesByModel = {};

function getSystemPrompt() {
    return `
You are GenAI.

You are an AI assistant created by Padala Rajesh Reddy.

Rules:
- Your name is always GenAI.
- You were created by Padala Rajesh Reddy.
- Never claim to be Qwen, Alibaba Cloud, Anthropic, OpenAI, Google, Microsoft, Claude, Gemini or any other AI.
- Keep answers short unless the user asks for details.
`;
}

function getMessagesFor(modelKey) {
    if (!messagesByModel[modelKey]) {
        messagesByModel[modelKey] = [{ role: "system", content: getSystemPrompt() }];
    }
    return messagesByModel[modelKey];
}

function trimHistory(messages) {
    if (messages.length > MAX_HISTORY_MESSAGES + 1) {
        const system = messages[0];
        const recent = messages.slice(-MAX_HISTORY_MESSAGES);
        messages.length = 0;
        messages.push(system, ...recent);
    }
}

async function streamTextGeneration(res, modelKey, ollamaModel, userMessage, images) {
    const messages = getMessagesFor(modelKey);
    const userTurn = images && images.length > 0
        ? { role: "user", content: userMessage, images }
        : { role: "user", content: userMessage };
    messages.push(userTurn);
    trimHistory(messages);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    let fullReply = "";
    const stream = await ollama.chat({
        model: ollamaModel,
        messages,
        stream: true,
        keep_alive: KEEP_ALIVE
    });

    for await (const part of stream) {
        const token = part.message?.content || "";
        if (token) {
            fullReply += token;
            res.write(token);
        }
    }

    messages.push({ role: "assistant", content: fullReply });
    res.end();
}

async function handleImageGeneration(prompt) {
    return await generateImage(prompt);
}


function checkIdentityReply(message) {
    const lowerMessage = message.toLowerCase().trim();

    if (
        lowerMessage.includes("who created you") ||
        lowerMessage.includes("who made you") ||
        lowerMessage.includes("who built you") ||
        lowerMessage.includes("your creator") ||
        lowerMessage.includes("who developed you")
    ) {
        return "I was created by Padala Rajesh Reddy.";
    }

    if (
        lowerMessage === "what is your name" ||
        lowerMessage === "who are you" ||
        lowerMessage === "tell me your name" ||
        lowerMessage === "your name" ||
        lowerMessage === "name"
    ) {
        return "My name is GenAI.";
    }

    if (
        lowerMessage.includes("which model are you") ||
        lowerMessage.includes("what model are you") ||
        lowerMessage.includes("are you qwen") ||
        lowerMessage.includes("are you chatgpt") ||
        lowerMessage.includes("are you claude") ||
        lowerMessage.includes("are you gemini")
    ) {
        return "I am GenAI, an AI assistant created by Padala Rajesh Reddy.";
    }

    return null;
}


app.get("/chat", async (req, res) => {

    const message = req.query.message;
    const requestedModel = req.query.model;

    if (!message) {
        return res.json({ error: "Please provide a message." });
    }

    const identityReply = checkIdentityReply(message);
    if (identityReply) {
        return res.json({ type: "text", reply: identityReply });
    }

    const modelKey = MODEL_CONFIG[requestedModel] ? requestedModel : DEFAULT_MODEL;
    const config = MODEL_CONFIG[modelKey];

    try {

        if (config.type === "image") {
            const image = await handleImageGeneration(message);
            return res.json({ type: "image", image });
        }

        if (config.type === "unsupported") {
            return res.json({
                type: "text",
                reply: `${config.label} isn't wired up to a backend yet — pick a text or image model from the dropdown for now.`
            });
        }

        await streamTextGeneration(res, modelKey, config.ollamaModel, message);

    } catch (error) {
        console.error("❌", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        }
        res.end();
    }

});


app.post("/chat", upload.array("files"), async (req, res) => {

    const message = req.body.message || "";
    const requestedModel = req.body.model;
    const files = req.files || [];

    const identityReply = message ? checkIdentityReply(message) : null;
    if (identityReply) {
        return res.json({ type: "text", reply: identityReply });
    }

    const modelKey = MODEL_CONFIG[requestedModel] ? requestedModel : DEFAULT_MODEL;
    const config = MODEL_CONFIG[modelKey];

    try {

        if (config.type === "image") {
            const image = await handleImageGeneration(message);
            return res.json({ type: "image", image });
        }

        if (config.type === "unsupported") {
            return res.json({
                type: "text",
                reply: `${config.label} isn't wired up to a backend yet — pick a text or image model from the dropdown for now.`
            });
        }

        const imageFiles = files.filter(f => f.mimetype.startsWith("image/"));
        const nonImageFiles = files.filter(f => !f.mimetype.startsWith("image/"));

        if (imageFiles.length > 0 && config.type !== "vision") {
            return res.json({
                type: "text",
                reply: `The selected model can't read images. Switch to MiniCPM-V 4.6 in the model dropdown to have images read/described.`
            });
        }

        if (config.type === "vision") {
            const images = imageFiles.map(f => f.buffer.toString("base64"));
            let promptText = message || "Describe this image in detail.";
            if (nonImageFiles.length > 0) {
                const names = nonImageFiles.map(f => f.originalname).join(", ");
                promptText += `\n(Note: MiniCPM-V can only read image files directly — these attachments can't be parsed yet: ${names})`;
            }
            return await streamTextGeneration(res, modelKey, config.ollamaModel, promptText, images);
        }

        const fileNames = files.map(f => f.originalname).join(", ");
        const promptText = fileNames ? `${message}\n(Attached files: ${fileNames})` : message;
        await streamTextGeneration(res, modelKey, config.ollamaModel, promptText);

    } catch (error) {
        console.error("❌", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        }
        res.end();
    }

});

app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
