function showConfirmDialog(title, message, onConfirm) {
    document.getElementById("confirm-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "confirm-overlay";
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            <div class="confirm-buttons">
                <button class="confirm-cancel" type="button">Cancel</button>
                <button class="confirm-ok" type="button">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".confirm-cancel").onclick = () => overlay.remove();
    overlay.querySelector(".confirm-ok").onclick = () => { overlay.remove(); onConfirm(); };
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function deleteChatConfirm() {
    const id = contextMenuChatId;
    hideContextMenu();
    if (!id || !allChats[id]) return;

    showConfirmDialog(
        "Delete chat?",
        "This chat and its messages will be permanently deleted.",
        () => {
            delete allChats[id];
            saveAll();
            if (currentChatId === id) {
                const remaining = Object.keys(allChats);
                remaining.length > 0 ? switchChat(remaining[0]) : newChat();
            }
            updateChatList();
        }
    );
}
