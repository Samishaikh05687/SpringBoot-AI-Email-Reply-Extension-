console.log("Email Writer content script loaded (Arrow Popup Centered UI)");

// --- Find Gmail compose toolbar ---
function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

// --- Create AI Button with embedded arrow ---
function createAIButtonWithArrow() {
    const button = document.createElement('button');
    button.className = 'ai-reply-button T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.innerHTML = 'AI Reply <span class="ai-arrow" style="display:inline-flex;align-items:center;position:absolute;right:10px;top:50%;transform:translateY(-50%);margin-left:6px;"><span style="display:inline-block;width:1px;height:30px;background:#fff;margin-right:6px; "></span><span style="font-size:8px;color:#fff;">▼</span></span>';
    button.style.backgroundColor = '#0B57D0';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '999px';
    button.style.padding = '15px 25px';
    button.style.marginRight = '8px';
    button.style.paddingRight = '32px'; // Add right padding to separate "AI Reply" text from arrow
    button.style.cursor = 'pointer';
    button.style.position = 'relative';
    return button;
}

// --- Create Centered Popup UI ---
function createPopupUI() {
    const container = document.createElement('div');
    container.className = 'ai-popup-ui';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.width = '400px';
    container.style.background = '#fff';
    container.style.border = '1px solid #d1d5db';
    container.style.borderRadius = '12px';
    container.style.padding = '16px';
    container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    container.style.zIndex = '9999';
    container.style.display = 'none';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.fontFamily = 'Arial, sans-serif';

    container.innerHTML = `
        <div style="display:flex;gap:6px;align-items:center;">
            <select class="ai-tone-selector" style="padding:6px;border-radius:6px;border:1px solid #d1d5db;flex:1;">
                <option value="professional">Professional</option>
                <option value="polite">Polite</option>
                <option value="friendly">Friendly</option>
                <option value="concise">Concise</option>
            </select>
            <button class="ai-generate-btn" style="background:#2563eb;color:#fff;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;">
                Generate
            </button>
        </div>
        <div class="ai-spinner" style="display:none;margin-top:6px;">
            <span style="display:inline-block;width:20px;height:20px;border:3px solid #2563eb;border-top:3px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></span>
        </div>
        <div class="ai-reply-box" style="min-height:80px;font-size:14px;white-space:pre-wrap;border:1px solid #e5e7eb;padding:8px;border-radius:6px;"></div>
        <div style="display:flex;gap:6px;margin-top:4px;">
            <button class="ai-copy-btn" style="flex:1;padding:6px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer;">Copy</button>
            <button class="ai-insert-btn" style="flex:1;padding:6px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer;">Insert</button>
        </div>
    `;

    // Spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
    `;
    container.appendChild(style);

    return container;
}

// --- Get email content ---
function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content && content.innerText.trim().length > 0) {
            console.log("✅ Found email content with selector:", selector, " → ", content.innerText.trim());
            return content.innerText.trim();
        }
    }
    console.warn("⚠️ No email content found with given selectors");
    return '';
}

// --- Typewriter effect ---
async function typeWriterEffect(element, text, delay = 20) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(res => setTimeout(res, delay));
    }
}

// --- Inject AI Button + Popup ---
function injectAIButtonWithPopup() {
    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const existingButton = toolbar.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const button = createAIButtonWithArrow();
    toolbar.insertBefore(button, toolbar.firstChild);

    const popupUI = createPopupUI();
    document.body.appendChild(popupUI);

    const generateBtn = popupUI.querySelector('.ai-generate-btn');
    const toneSelector = popupUI.querySelector('.ai-tone-selector');
    const replyBox = popupUI.querySelector('.ai-reply-box');
    const spinner = popupUI.querySelector('.ai-spinner');
    const copyBtn = popupUI.querySelector('.ai-copy-btn');
    const insertBtn = popupUI.querySelector('.ai-insert-btn');

    // Toggle popup on button click (arrow inside button)
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        popupUI.style.display = popupUI.style.display === 'none' ? 'flex' : 'none';
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!popupUI.contains(e.target) && !button.contains(e.target)) popupUI.style.display = 'none';
    });

    // Generate AI reply
    generateBtn.addEventListener('click', async () => {
        const emailContent = getEmailContent();
        const tone = toneSelector.value;
        if (!emailContent) {
            replyBox.textContent = "⚠️ Could not find email content!";
            return;
        }

        replyBox.textContent = '';
        spinner.style.display = 'block';

        try {
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailContent, tone })
            });

            spinner.style.display = 'none';
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.text();
            await typeWriterEffect(replyBox, data, 20);

        } catch (err) {
            console.error(err);
            spinner.style.display = 'none';
            replyBox.textContent = "⚠️ Failed to generate reply. Please try again.";
        }
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(replyBox.textContent);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 1000);
    });

    // Insert button
    insertBtn.addEventListener('click', () => {
        const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
        if (composeBox) {
            composeBox.focus();
            document.execCommand('insertText', false, replyBox.textContent);
            popupUI.style.display = 'none';
        }
    });
}

// --- Observe Gmail ---
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasCompose = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.btC,.aDh,[role="dialog"]') || node.querySelector('.aDh, .btC ,[role="dialog"]'))
        );
        if (hasCompose) setTimeout(injectAIButtonWithPopup, 500);
    }
});

observer.observe(document.body, { childList: true, subtree: true });
