function saveAll() {
    localStorage.setItem("genai_chats", JSON.stringify(allChats));
    localStorage.setItem("currentChatId", currentChatId);
}
