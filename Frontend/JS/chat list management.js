function newChat() {
    currentChatId = "chat-" + Date.now();
    allChats[currentChatId] = { title: "New Chat", messages: [], timestamp: Date.now() };
    localStorage.setItem("currentChatId", currentChatId);

    chat.innerHTML = `
        <div class="empty">
            <div class="empty-icon">✦</div>
            <p class="empty-title">New conversation started</p>
            <p class="empty-text">Ask me anything.</p>
        </div>
    `;
    updateChatList();
    saveAll();
    closeSidebarOnMobile();
}

function updateChatList(filteredChats = null) {
    const list = document.getElementById("chat-list");
    if (!list) return;

    const toolbar = document.getElementById("select-toolbar");
    if (toolbar) {
        toolbar.classList.toggle("visible", selectMode);
        const allIds = Object.keys(allChats);
        const allSelectedCb = document.getElementById("select-all-checkbox");
        if (allSelectedCb) {
            allSelectedCb.checked = allIds.length > 0 && allIds.every(id => selectedChatIds.has(id));
        }
    }

    const selectBtn = document.getElementById("select-toggle-btn");
    if (selectBtn) {
        selectBtn.textContent = selectMode ? "Done" : "Select";
        selectBtn.classList.toggle("active", selectMode);
    }

    let chatsToShow = filteredChats || Object.entries(allChats);

    let html = '';
    chatsToShow
        .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
        .forEach(([id, chatData]) => {
            const isActive = id === currentChatId;
            const isChecked = selectedChatIds.has(id);
            html += `
                <div class="chat-item ${isActive ? 'active' : ''}"
                     data-chat-id="${id}"
                     onclick="handleChatItemClick('${id}', event)"
                     oncontextmenu="showContextMenu(event, '${id}')">
                    ${selectMode ? `<input type="checkbox" class="chat-select-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleChatSelection('${id}')">` : ''}
                    <div class="title">
                        ${escapeHtml(chatData.title || "Untitled Chat")}
                    </div>
                    <div class="date">${new Date(chatData.timestamp || Date.now()).toLocaleDateString()}</div>
                </div>
            `;
        });

    list.innerHTML = html || "<p style='padding:20px; color:#666; text-align:center;'>No chats yet</p>";
}

function searchChats() {
    const term = document.getElementById("chat-search").value.toLowerCase();
    if (!term) {
        updateChatList();
        return;
    }

    const filtered = Object.entries(allChats).filter(([id, chat]) =>
        chat.title && chat.title.toLowerCase().includes(term)
    );
    updateChatList(filtered);
}

function switchChat(chatId) {
    currentChatId = chatId;
    localStorage.setItem("currentChatId", chatId);
    loadCurrentChat();
    updateChatList();
    closeSidebarOnMobile();
}

function loadCurrentChat() {
    chat.innerHTML = "";
    const data = allChats[currentChatId];

    if (!data || !data.messages || data.messages.length === 0) {
        chat.innerHTML = `
            <div class="empty">
                <div class="empty-icon">✦</div>
                <p class="empty-title">Nothing here yet</p>
                <p class="empty-text">Type any question below.</p>
            </div>
        `;
        return;
    }

    data.messages.forEach(msg => {
        addMessage(msg.role, msg.content, false);
    });
}
