async function sendMessage() {
    const text = input.value.trim();
    if (!text && attachedFiles.length === 0) return;

    const empty = chat.querySelector(".empty");
    if (empty) empty.remove();

    const filesToSend = [...attachedFiles];
    attachedFiles = [];
    renderAttachmentPreview();

    let userMessage = text;
    if (filesToSend.length > 0) {
        const fileList = filesToSend.map(a => `📎 ${a.file.name}`).join("\n");
        userMessage = text ? `${text}\n${fileList}` : fileList;
    }

    addMessage("user", userMessage);
    input.value = "";
    input.style.height = "auto";

    const aiDiv = addMessage("assistant", "", false);
    const contentDiv = aiDiv.querySelector(".message-content");
    contentDiv.innerHTML = `<span class="typing-indicator"><span></span><span></span><span></span></span>`;

    currentAbortController = new AbortController();
    setGeneratingUI(true);

    try {
        let res;

        if (filesToSend.length > 0) {
            const formData = new FormData();
            formData.append("message", text);
            formData.append("chatId", currentChatId);
            formData.append("model", selectedModel);

            const preparedFiles = await Promise.all(
                filesToSend.map(a => resizeImageFile(a.file))
            );
            preparedFiles.forEach(f => formData.append("files", f, f.name));

            res = await fetch("http://localhost:3000/chat", {
                method: "POST",
                body: formData,
                signal: currentAbortController.signal
            });
        } else {
            const url = `http://localhost:3000/chat?message=${encodeURIComponent(text)}&chatId=${encodeURIComponent(currentChatId)}&model=${encodeURIComponent(selectedModel)}`;
            res = await fetch(url, { signal: currentAbortController.signal });
        }

        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await res.json();

            if (data.error) {
                contentDiv.innerHTML = `Error: ${escapeHtml(data.error)}`;
                setGeneratingUI(false);
                saveAll();
                updateChatList();
                return;
            }

            if (data.type === "image") {
                const parsedImgTag = `<img src="${data.image}" alt="Generated Media" style="max-width:100%; border-radius:8px; margin-top:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">`;
                contentDiv.innerHTML = parsedImgTag;

                if (!allChats[currentChatId]) allChats[currentChatId] = { title: "New Chat", messages: [], timestamp: Date.now() };
                allChats[currentChatId].messages.push({ role: "assistant", content: parsedImgTag });
            } else {
                const reply = data.reply || "Got it!";
                contentDiv.innerHTML = formatMessageContent(reply);
                highlightCodeBlocks(contentDiv);

                if (!allChats[currentChatId]) allChats[currentChatId] = { title: "New Chat", messages: [], timestamp: Date.now() };
                allChats[currentChatId].messages.push({ role: "assistant", content: reply });
            }

            allChats[currentChatId].timestamp = Date.now();

        } else {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullReply = "";
            contentDiv.innerHTML = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullReply += decoder.decode(value, { stream: true });
                contentDiv.innerHTML = formatMessageContent(fullReply, true);
                highlightCodeBlocks(contentDiv);
                autoScrollChat(true);
            }

            if (currentAbortController.signal.aborted) {
                contentDiv.innerHTML = formatMessageContent(fullReply, true) + ' <span class="stopped-tag">(stopped)</span>';
                highlightCodeBlocks(contentDiv);
            } else {
                contentDiv.innerHTML = formatMessageContent(fullReply);
                highlightCodeBlocks(contentDiv);
            }

            if (!allChats[currentChatId]) allChats[currentChatId] = { title: "New Chat", messages: [], timestamp: Date.now() };
            allChats[currentChatId].messages.push({ role: "assistant", content: fullReply });
            allChats[currentChatId].timestamp = Date.now();
        }

    } catch(e) {
        if (e.name === "AbortError") {
            contentDiv.innerHTML += ' <span class="stopped-tag">(stopped)</span>';
        } else {
            contentDiv.innerHTML = "Error connecting to server.";
        }
    }

    setGeneratingUI(false);
    saveAll();
    updateChatList();
}
