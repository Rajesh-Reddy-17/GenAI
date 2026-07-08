function injectSidebarBackdrop() {
    if (document.getElementById("sidebar-backdrop")) return;
    const backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    backdrop.onclick = () => {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("open");
        backdrop.classList.remove("visible");
        document.getElementById("sidebar-toggle")?.classList.remove("active");
    };
    document.body.appendChild(backdrop);
}

function syncBackdrop() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar || !backdrop) return;
    if (sidebar.classList.contains("open")) {
        backdrop.classList.add("visible");
    } else {
        backdrop.classList.remove("visible");
    }
}

function injectSidebar() {
    const sidebarHTML = `
        <div id="sidebar">
            <div id="sidebar-header">
                <div class="header-row">
                    <button onclick="newChat()">+ New Chat</button>
                    <button id="select-toggle-btn" type="button" onclick="toggleSelectModeButton()">Select</button>
                </div>
                <input type="text" id="chat-search" placeholder="Search chats..." onkeyup="searchChats()">
            </div>
            <div id="select-toolbar">
                <label><input type="checkbox" id="select-all-checkbox" onclick="toggleSelectAll()"> Select All</label>
                <div class="toolbar-actions">
                    <button class="delete-btn" type="button" onclick="deleteSelectedChats()">Delete</button>
                    <button class="cancel-btn" type="button" onclick="cancelSelectMode()">Cancel</button>
                </div>
            </div>
            <div id="chat-list"></div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    updateChatList();

    injectModelSelector();
    injectContextMenu();
    injectSidebarBackdrop();
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.toggle("open");
    }
    document.getElementById("sidebar-toggle")?.classList.toggle("active");
    syncBackdrop();
}

function closeSidebarOnMobile() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.remove("open");
        document.getElementById("sidebar-toggle")?.classList.remove("active");
        syncBackdrop();
    }
}
