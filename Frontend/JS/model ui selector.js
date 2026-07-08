let selectMode = false;
let selectedChatIds = new Set();
let contextMenuChatId = null;

function injectModelSelector() {
    if (document.getElementById("model-selector-wrapper")) return;

    const inputRow = document.getElementById("input-row");
    const micBtn = document.getElementById("mic-btn");
    const wrapper = document.createElement("div");
    wrapper.id = "model-selector-wrapper";

    const current = MODELS.find(m => m.id === selectedModel) || MODELS[0];

    wrapper.innerHTML = `
        <button id="model-selector-btn" type="button" onclick="toggleModelDropdown(event)">
            <span class="model-icon-badge" style="background:${current.gradient}">${current.icon}</span>
            <span class="model-name">${current.name}</span>
            <span class="model-purpose">(${current.purpose})</span>
            <span class="chevron">▾</span>
        </button>
        <div id="model-dropdown-list" class="hidden"></div>
    `;

    inputRow.insertBefore(wrapper, micBtn);
    renderModelOptions();
}

function renderModelOptions() {
    const list = document.getElementById("model-dropdown-list");
    if (!list) return;
    list.innerHTML = MODELS.map(m => {
        const isDisabled = m.connected === false;
        return `
        <div class="model-option ${m.id === selectedModel ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
             onclick="${isDisabled ? 'showModelUnavailableNote(event)' : `selectModel('${m.id}')`}">
            <span class="model-icon-badge" style="background:${m.gradient}">${m.icon}</span>
            <span class="model-text">
                <span class="m-name">${m.name}</span>
                <span class="m-purpose">${m.purpose}${isDisabled ? ' · Not connected yet' : ''}</span>
            </span>
        </div>
    `;
    }).join("");
}

function showModelUnavailableNote(e) {
    if (e) e.stopPropagation();
    const list = document.getElementById("model-dropdown-list");
    if (!list || list.querySelector(".model-unavailable-note")) return;
    const note = document.createElement("div");
    note.className = "model-unavailable-note";
    note.textContent = "Not connected to a backend yet — pick another model.";
    list.appendChild(note);
    setTimeout(() => note.remove(), 2200);
}

function toggleModelDropdown(e) {
    if (e) e.stopPropagation();
    const list = document.getElementById("model-dropdown-list");
    const btn = document.getElementById("model-selector-btn");
    list.classList.toggle("hidden");
    btn.classList.toggle("open");
}

function selectModel(id) {
    selectedModel = id;
    localStorage.setItem("selectedModel", id);
    const current = MODELS.find(m => m.id === id);
    const btn = document.getElementById("model-selector-btn");
    btn.querySelector(".model-icon-badge").style.background = current.gradient;
    btn.querySelector(".model-icon-badge").textContent = current.icon;
    btn.querySelector(".model-name").textContent = current.name;
    btn.querySelector(".model-purpose").textContent = `(${current.purpose})`;
    renderModelOptions();
    document.getElementById("model-dropdown-list").classList.add("hidden");
    btn.classList.remove("open");
}

document.addEventListener("click", (e) => {
    const wrapper = document.getElementById("model-selector-wrapper");
    if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById("model-dropdown-list")?.classList.add("hidden");
        document.getElementById("model-selector-btn")?.classList.remove("open");
    }
});
