function enterSelectMode(chatId) {
    hideContextMenu();
    selectMode = true;
    selectedChatIds.clear();
    if (chatId) selectedChatIds.add(chatId);
    updateChatList();
}

function toggleSelectModeButton() {
    if (selectMode) {
        cancelSelectMode();
    } else {
        enterSelectMode(null);
    }
}

function cancelSelectMode() {
    selectMode = false;
    selectedChatIds.clear();
    updateChatList();
}

function toggleChatSelection(id) {
    if (selectedChatIds.has(id)) {
        selectedChatIds.delete(id);
    } else {
        selectedChatIds.add(id);
    }
    updateChatList();
}

function toggleSelectAll() {
    const allIds = Object.keys(allChats);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedChatIds.has(id));
    if (allSelected) {
        selectedChatIds.clear();
    } else {
        allIds.forEach(id => selectedChatIds.add(id));
    }
    updateChatList();
}

function deleteSelectedChats() {
    if (selectedChatIds.size === 0) return;

    showConfirmDialog(
        "Delete selected chats?",
        `${selectedChatIds.size} chat(s) will be permanently deleted.`,
        () => {
            let deletedCurrent = false;
            selectedChatIds.forEach(id => {
                if (id === currentChatId) deletedCurrent = true;
                delete allChats[id];
            });
            saveAll();
            selectMode = false;
            selectedChatIds.clear();

            if (deletedCurrent) {
                const remaining = Object.keys(allChats);
                remaining.length > 0 ? switchChat(remaining[0]) : newChat();
            }
            updateChatList();
        }
    );
}

function handleChatItemClick(id, event) {
    if (selectMode) {
        event.stopPropagation();
        toggleChatSelection(id);
    } else {
        switchChat(id);
    }
}
