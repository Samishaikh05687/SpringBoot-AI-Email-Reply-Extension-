const emailContentInput = document.getElementById("emailContent");
const toneSelector = document.getElementById("toneSelector");
const generateBtn = document.getElementById("generateBtn");
const replyBox = document.getElementById("replyBox");
const fetchGmailBtn = document.getElementById("fetchGmailBtn");

// Fetch selected email content from Gmail via content script
fetchGmailBtn.addEventListener("click", async () => {
  replyBox.textContent = "⏳ Fetching email from Gmail...";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.innerText.trim().length > 0) return el.innerText.trim();
        }
        return '';
      }
    }, (results) => {
      const content = results?.[0]?.result || '';
      if (content) {
        emailContentInput.value = content;
        replyBox.textContent = "✅ Email content fetched!";
      } else {
        replyBox.textContent = "⚠️ No email content found!";
      }
    });
  } catch (err) {
    console.error(err);
    replyBox.textContent = "⚠️ Failed to fetch email content!";
  }
});

// Generate AI reply via backend
generateBtn.addEventListener("click", async () => {
  const emailContent = emailContentInput.value.trim();
  const tone = toneSelector.value;

  if (!emailContent) {
    replyBox.textContent = "⚠️ Please provide email content first!";
    return;
  }

  replyBox.textContent = "⏳ Generating reply...";

  try {
    const response = await fetch("http://localhost:8080/api/email/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailContent, tone })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    replyBox.textContent = data;
  } catch (err) {
    console.error(err);
    replyBox.textContent = "⚠️ Failed to generate reply.";
  }
});
