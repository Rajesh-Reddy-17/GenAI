function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function buildCodeBlockHtml(lang, code, codeId, isPartial) {
    const id = codeId || `code-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const copyButton = isPartial
        ? ''
        : `<button class="copy-code-btn" type="button" onclick="copyCodeBlock('${id}', this)">
               <span class="copy-icon">📋</span><span class="copy-label">Copy</span>
           </button>`;
    return `
        <div class="code-block-wrapper${isPartial ? ' streaming' : ''}">
            <div class="code-block-header">
                <span class="code-lang">${escapeHtml(lang || 'text')}</span>
                ${copyButton}
            </div>
            <pre><code id="${id}" class="hljs${lang ? ' language-' + lang : ''}">${escapeHtml(code)}</code></pre>
        </div>
    `;
}

function formatMessageContent(text, streaming = false) {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let result = '';
    let lastIndex = 0;
    let match;
    let counter = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        result += escapeHtml(text.slice(lastIndex, match.index));

        const lang = (match[1] || '').toLowerCase();
        const code = match[2].replace(/\n$/, '');
        counter++;
        const codeId = `code-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}`;

        result += buildCodeBlockHtml(lang, code, codeId, false);

        lastIndex = codeBlockRegex.lastIndex;
    }

    const tail = text.slice(lastIndex);

    if (streaming) {
        const openFence = tail.match(/```(\w*)\n?([\s\S]*)$/);
        if (openFence) {
            result += escapeHtml(tail.slice(0, openFence.index));
            const lang = (openFence[1] || '').toLowerCase();
            result += buildCodeBlockHtml(lang, openFence[2], null, true);
            return result;
        }
    }

    result += escapeHtml(tail);
    return result;
}

function highlightCodeBlocks(container) {
    if (!window.hljs) return;
    container.querySelectorAll('pre code').forEach(block => {
        window.hljs.highlightElement(block);
    });
}

function copyCodeBlock(codeId, btnEl) {
    const codeEl = document.getElementById(codeId);
    if (!codeEl) return;
    const codeText = codeEl.textContent;

    const showCopied = () => {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = `<span class="copy-icon">✅</span><span class="copy-label">Copied!</span>`;
        btnEl.classList.add('copied');
        setTimeout(() => {
            btnEl.innerHTML = original;
            btnEl.classList.remove('copied');
        }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText).then(showCopied).catch(() => fallbackCopy(codeText, showCopied));
    } else {
        fallbackCopy(codeText, showCopied);
    }
}

function fallbackCopy(text, onDone) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (e) {
        console.error('Copy failed:', e);
    }
    document.body.removeChild(textarea);
    onDone();
}
