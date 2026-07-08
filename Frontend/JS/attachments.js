let attachedFiles = [];

function triggerFileInput() {
    document.getElementById("file-input")?.click();
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
        attachedFiles.push({
            id: "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            file,
            isImage: file.type.startsWith("image/")
        });
    });
    event.target.value = "";
    renderAttachmentPreview();
}

function removeAttachment(id) {
    attachedFiles = attachedFiles.filter(a => a.id !== id);
    renderAttachmentPreview();
}

function renderAttachmentPreview() {
    const box = document.getElementById("attachment-preview");
    if (!box) return;
    if (attachedFiles.length === 0) {
        box.classList.add("hidden");
        box.innerHTML = "";
        return;
    }
    box.classList.remove("hidden");
    box.innerHTML = attachedFiles.map(a => {
        const shortName = a.file.name.length > 18 ? a.file.name.slice(0, 15) + "…" : a.file.name;
        const thumb = a.isImage
            ? `<img src="${URL.createObjectURL(a.file)}" alt="">`
            : `<span class="chip-icon">📄</span>`;
        return `
            <div class="attachment-chip" data-id="${a.id}">
                ${thumb}
                <span class="chip-name">${escapeHtml(shortName)}</span>
                <span class="remove-chip" onclick="removeAttachment('${a.id}')">✕</span>
            </div>
        `;
    }).join("");
}
