# Chatbot Integration Guide (Google AI Studio)

This guide explains, step by step, how to integrate your chatbot with Google AI Studio in this project.

## 1. Goal

Connect the frontend chatbot to a secure backend endpoint that calls Google AI Studio through an OpenAI-compatible API.

## 2. Prerequisites

- Backend and frontend project already installed
- A Google AI Studio account
- A generated API key from Google AI Studio

## 3. Architecture (Current Project)

- Frontend sends user message to backend endpoint:
  - POST /api/chatbot/message
- Backend calls provider API using server-side key (never expose key to frontend)
- Backend returns final assistant text
- Frontend displays assistant response

## 4. Generate API Key in Google AI Studio

1. Open Google AI Studio.
2. Create or select a project.
3. Generate an API key.
4. Copy the key.

## 5. Configure Backend Environment

Edit backend/.env (not backend/.env.example) and add:

GEMINI_API_KEY=YOUR_GOOGLE_AI_STUDIO_KEY
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
GEMINI_MODEL=gemini-2.0-flash
GEMINI_SITE_URL=http://localhost:5173
GEMINI_SITE_NAME=Elite Drive
GEMINI_SYSTEM_PROMPT="Tu es un assistant utile et concis pour une plateforme de location de voitures. Reponds en francais."

Notes:

- Keep GEMINI_API_KEY secret.
- Do not commit backend/.env.

## 6. Refresh Laravel Config

From backend folder:

    php artisan config:clear

Then restart the backend server if it is running.

## 7. Verify Backend Endpoint Exists

The following files should already be present in your codebase:

- backend/app/Http/Controllers/Api/ChatbotController.php
- backend/app/Services/ChatbotService.php
- backend/app/Http/Requests/ChatbotMessageRequest.php
- backend/routes/api.php

Route should include:

    Route::post('/chatbot/message', [ChatbotController::class, 'reply'])
        ->middleware('throttle:20,1');

## 8. Verify Frontend Integration Exists

The following files should already be present:

- frontend/src/services/chatbotService.js
- frontend/src/components/features/Chatbot.jsx

Frontend flow:

- Chatbot UI sends message to /api/chatbot/message
- If provider fails, chatbot falls back to local rule-based response

Conversation memory:

- Frontend now sends recent turns in `history`
- Backend validates `history` and keeps the latest 10 messages for context
- This improves continuity across follow-up questions

## 9. Run the App

Terminal 1 (backend):

    cd backend
    php artisan serve

Terminal 2 (frontend):

    cd frontend
    npm run dev

Open the frontend URL and test chatbot.

## 10. Quick API Test (Optional)

Use this request to test backend endpoint directly:

    POST http://localhost:8000/api/chatbot/message
    Content-Type: application/json

    {
      "message": "Bonjour, quels sont vos tarifs ?",
      "history": [
        { "role": "assistant", "content": "Bonjour, je peux vous aider." },
        { "role": "user", "content": "Je veux louer une voiture." }
      ]
    }

Expected response format:

    {
      "success": true,
      "data": {
        "reply": "..."
      }
    }

## 11. Troubleshooting

### A. Chatbot says provider unavailable

Check:

- GEMINI_API_KEY is set in backend/.env
- GEMINI_BASE_URL and GEMINI_MODEL are valid
- php artisan config:clear was executed

### B. 429 or quota errors

- You exceeded provider limits
- Change model or wait for quota reset

### C. 401/403 from provider

- API key invalid or restricted
- Regenerate key and update backend/.env

### D. Frontend works but no AI response

- Check backend logs:

  backend/storage/logs/laravel.log

## 12. Security Checklist

- Keep API key only in backend/.env
- Never store provider keys in frontend source
- Keep route throttling enabled
- Avoid logging sensitive user data

## 13. Recommended Next Improvements

1. Add short conversation memory (last 5 to 10 messages).
2. Add retry with timeout handling in backend service.
3. Add analytics for top chatbot intents.
4. Add language toggle for French/English replies.
