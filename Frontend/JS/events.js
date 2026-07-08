window.addEventListener('resize', () => {
    syncBackdrop();
});

input.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;

    if (e.shiftKey) {
        e.preventDefault();
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.value = input.value.slice(0, start) + "\n" + input.value.slice(end);
        input.selectionStart = input.selectionEnd = start + 1;
        autoResizeMessageInput();
        return;
    }

    e.preventDefault();
    sendMessage();
});

function autoResizeMessageInput() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 200) + "px";
}
input.addEventListener("input", autoResizeMessageInput);

function init() {
    injectSidebar();

    if (!currentChatId || !allChats[currentChatId]) {
        newChat();
    } else {
        loadCurrentChat();
    }

    console.log("✅ Full chat system with sidebar loaded");
}

init();
