function addMessage(role, content, shouldSave = true) {
    const div = document.createElement("div");
    div.className = role === "user" ? "user" : "bot-bubble";

    const isImageContent = content.startsWith("<img");

    div.innerHTML = `
        <strong>${role === "user" ? "You" : "GenAI"}</strong>
        <div class="message-content">${isImageContent ? content : formatMessageContent(content)}</div>
    `;

    chat.appendChild(div);
    if (role === "user") {
        stickToBottom = true;
    }
    autoScrollChat(false);

    if (!isImageContent) {
        highlightCodeBlocks(div);
    }

    if (shouldSave) {
        if (!allChats[currentChatId]) allChats[currentChatId] = { title: "New Chat", messages: [], timestamp: Date.now() };
        allChats[currentChatId].messages.push({ role, content });
        allChats[currentChatId].timestamp = Date.now();
        updateTitle();
        saveAll();
    }

    return div;
}

const GREETING_WORDS = ["hi", "hello", "hey", "hii", "hiya", "hlo", "yo", "sup", "hola",
    "good morning", "good evening", "good afternoon", "gm", "gn"];

function updateTitle() {
    const data = allChats[currentChatId];
    if (!data || data.messages.length === 0) return;
    if (data.titleLocked) return;

    const meaningful = data.messages.find(m =>
        m.role === "user" &&
        m.content.trim().length > 2 &&
        !GREETING_WORDS.includes(m.content.trim().toLowerCase())
    );

    if (meaningful) {
        data.title = meaningful.content.substring(0, 35) + (meaningful.content.length > 35 ? "..." : "");
    }
}
