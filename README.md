# AI Email Reply Assistant

**AI Email Reply Assistant** is a Chrome extension powered by AI that helps users generate professional email replies automatically. It leverages a **Spring Boot backend** to communicate with **Gemini AI** for content generation, providing a smooth and efficient email drafting experience directly within Gmail.

---

## 🔹 Project Description

This project consists of three main components:

1. **Chrome Extension (Frontend)**  
   - Detects Gmail compose windows.
   - Adds an AI Reply button with a dropdown arrow.
   - Provides a popup for generating, copying, and inserting AI-generated replies.
   - Supports multiple tones for replies (Professional, Polite, Friendly, Concise).

2. **Spring Boot Backend**  
   - Exposes an API endpoint to generate email replies.
   - Sends the email content and tone to Gemini AI and returns the generated reply.

3. **Gemini AI Integration**  
   - Uses Gemini AI models for natural language generation.
   - Produces clear, professional, and context-aware email replies.

---

## 🔹 Features

- **AI-Powered Email Replies** – Generate professional email responses instantly.  
- **Tone Selection** – Choose the tone of the reply (Professional, Polite, Friendly, Concise).  
- **Copy & Insert** – Copy the generated reply to clipboard or insert directly into Gmail.  
- **Popup Modal** – Centralized popup for user interaction with the AI.  
- **Gmail Integration** – Works seamlessly with Gmail compose windows.  
- **Spinner & Typewriter Effect** – Provides real-time feedback while AI generates the reply.  

---

## 🔹 Installation

### Backend (Spring Boot)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-email-reply-assistant.git
   cd ai-email-reply-assistant/backend
    ```
2. Set up environment variables in application.properties:
   ```bash
   spring.application.name=email-writer-sb
   gemini.api.url=<YOUR_GEMINI_API_URL>
    gemini.api.key=<YOUR_GEMINI_API_KEY>
    ```
3. Build and run the backend:
   ```bash
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```    
