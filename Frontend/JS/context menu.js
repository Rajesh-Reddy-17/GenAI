let currentAbortController = null;
let isGenerating = false;

function setGeneratingUI(active) {
    isGenerating = active;
    const btn = document.getElementById("send-btn");
    const sendIcon = document.getElementById("send-icon");
    const stopIcon = document.getElementById("stop-icon");
    if (!btn) return;
    btn.classList.toggle("generating", active);
    sendIcon?.classList.toggle("hidden", active);
    stopIcon?.classList.toggle("hidden", !active);
}

function stopGenerating() {
    if (currentAbortController) currentAbortController.abort();
    setGeneratingUI(false);
}

function handleSendClick() {
    if (isGenerating) {
        stopGenerating();
    } else {
        sendMessage();
    }
}


function injectContextMenu() {
    if (document.getElementById("context-menu")) return;
    const menu = document.createElement("div");
    menu.id = "context-menu";
    menu.style.display = "none";
    menu.innerHTML = `
        <div onclick="renameChatPrompt()">✏️ Rename</div>
        <div onclick="enterSelectMode(contextMenuChatId)">☑️ Select</div>
        <div onclick="deleteChatConfirm()">🗑️ Delete</div>
    `;
    document.body.appendChild(menu);
}

function showContextMenu(event, chatId) {
    event.preventDefault();
    contextMenuChatId = chatId;
    const menu = document.getElementById("context-menu");
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
    menu.style.display = "block";
}

function hideContextMenu() {
    const menu = document.getElementById("context-menu");
    if (menu) menu.style.display = "none";
}

document.addEventListener("click", hideContextMenu);
document.addEventListener("scroll", hideContextMenu, true);

function renameChatPrompt() {
    const id = contextMenuChatId;
    hideContextMenu();
    if (!id || !allChats[id]) return;
    const newTitle = window.prompt("Rename chat:", allChats[id].title || "Untitled Chat");
    if (newTitle && newTitle.trim()) {
        allChats[id].title = newTitle.trim().substring(0, 50);
        allChats[id].titleLocked = true;
        saveAll();
        updateChatList();
    }
}
