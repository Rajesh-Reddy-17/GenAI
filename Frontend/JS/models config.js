const MODELS = [
    { id: "qwen2.5:7b",        name: "Qwen2.5:7B",         purpose: "Text Generation",          icon: "💬", gradient: "linear-gradient(135deg,#7C5CFF,#22D3EE)", connected: true },
    { id: "qwen2.5-coder:7b",  name: "Qwen2.5-Coder:7B",   purpose: "Coding",                    icon: "💻", gradient: "linear-gradient(135deg,#11998e,#38ef7d)", connected: true },
    { id: "flux.1-schnell",    name: "Flux.1-Schnell",     purpose: "Image Generation",          icon: "🎨", gradient: "linear-gradient(135deg,#f7971e,#ffd200)", connected: true },
    { id: "minicpm-v-4.6",     name: "MiniCPM-V 4.6",      purpose: "Reading Images & Documents",icon: "🖼️", gradient: "linear-gradient(135deg,#00c6ff,#0072ff)", connected: true },
    { id: "deepseek-r1:8b",    name: "DeepSeek-R1:8B",     purpose: "Maths",                     icon: "🧮", gradient: "linear-gradient(135deg,#ff512f,#dd2476)", connected: true },
    { id: "dolphin-llama3:8b", name: "Dolphin-Llama3:8B",  purpose: "Uncensored Chat",           icon: "🐬", gradient: "linear-gradient(135deg,#232526,#414345)", connected: true },
    { id: "translategemma:4b", name: "TranslateGemma:4B",  purpose: "Translation",               icon: "🌐", gradient: "linear-gradient(135deg,#43cea2,#185a9d)", connected: true }
];

let selectedModel = localStorage.getItem("selectedModel") || MODELS[0].id;
(function ensureConnectedModelSelected() {
    const stored = MODELS.find(m => m.id === selectedModel);
    if (!stored || stored.connected === false) {
        selectedModel = (MODELS.find(m => m.connected !== false) || MODELS[0]).id;
        localStorage.setItem("selectedModel", selectedModel);
    }
})();
