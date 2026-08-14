# AI Chatbot

A simple full-stack AI chatbot built with HTML, CSS, JavaScript, Node.js, Express, and Google Gemini API.

The project provides a clean web-based chat interface where users can send messages and receive AI-generated responses from Gemini. The Gemini API key is kept securely on the backend using environment variables.

## Features
- Clean and responsive chatbot interface

- User and AI message bubbles

- Real-time typing indicator

- Enter key to send messages

- Shift + Enter for a new line

- Auto-growing message input

- Clear chat functionality

- Conversation history support

- Gemini AI integration

- Express backend API

- API key protected on the server

- Frontend served directly by the Node.js backend

- Error handling for backend/API failures

- Responsive design for smaller screens

- Reduced-motion support for accessibility

## Tech Stack
### Frontend
- HTML5

- CSS3

- JavaScript

- Google Fonts

### Backend

- Node.js

- Express.js

- Google Gemini API

- @google/genai

- dotenv
## Project Structure

```bash
chatBot/
└── backend/
    ├── public/
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    │
    ├── node_modules/
    │
    ├── .gitignore
    ├── chat.js
    ├── package.json
    └── package-lock.json
```
## How It Works
The application follows this flow:
```bash

User
  │
  ▼
Frontend
(index.html + script.js)
  │
  │ POST /api/chat
  ▼
Express Server
(chat.js)
  │
  │ Gemini API
  ▼
Google Gemini
  │
  │ AI response
  ▼
Express Server
  │
  │ JSON response
  ▼
Frontend
  │
  ▼
Chat UI
```
The frontend never directly accesses the Gemini API key.

Instead, the frontend sends the user's message to:
```bash
POST /api/chat
```
The Node.js backend receives the message, sends it to Gemini, and returns the generated response to the browser.

## Prerequisites
Before running the project, make sure you have:
- Node.js installed
- npm installed
- A Gemini API key
- Internet connection

The project uses the Google Gemini Node.js SDK.
### Installation
1. Clone the repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```
Move into the project:
```bash
cd chatBot/backend
```
2. Install dependencies
```bash
npm install
```
If Express has not been installed yet:
```bash
npm install express
```
The main dependencies are:
```bash
@google/genai
dotenv
express
```
## Environment Variables

Create a `.env` file inside the backend folder:

```plaintext
GEMENI_API_KEY=your_gemini_api_key_here
```

Keep your API key private. Never put the API key inside `index.html` or `script.js`.

Also make sure `.env` is included in `.gitignore`:

```
node_modules/
.env
```

## Running the Project

Open a terminal inside:

```plaintext
chatBot/backend
```

Run:

```bash
node chat.js
```

You should see:

**Server running at http://localhost:3000**

Now open your browser and visit:

[http://localhost:3000](http://localhost:3000)

the chatbot interface should appear.

## API Endpoint
Chat 
```bash
POST /api/chat
```
### Request 
The frontend sends JSON similar to:
```json
{
  "message": "Hello",
  "history": [
    {
      "role": "user",
      "content": "Hello"
    }
  ]
}
```
### Response
the backend returns:
```json
{
  "reply": "Hello! How can I help you today?"
}
```
### Conversation history
The frontend maintains a conversation history using JavaScript.

Example:
```json
[
  {
    role: "user",
    content: "Hello"
  },
  {
    role: "bot",
    content: "Hello! How can I help you?"
  },
  {
    role: "user",
    content: "What can you do?"
  }
]
```
Before sending the conversation to Gemini, the backend converts the roles into Gemini-compatible roles:
```bash
user → user
bot  → model
```
This allows the chatbot to maintain context during the current session.

### Frontend
The frontend consists of three files.

`index.html`

Contains:
- Chatbot header
- Online status
- Chat message area
- Message input
- Send button
- Clear button
- Typing interface

`style.css`

Controls:

- Colors
- Typography
- Message bubbles
- Layout
- Responsive design
- Animations
- Input styling
- Scrollbar
- Mobile layout

`script.js`

Handles:

- Sending messages
- Receiving responses
- Calling `/api/chat`
- Conversation history
- Typing animation
- Auto-growing textarea
- Enter-to-send functionality
- Clear chat functionality
- Error handling
### Backend

The backend is implemented in:
```bash
chat.js
```
It performs three main jobs:

### 1. Serves the frontend

Express serves the files inside:
```bash
public/
```
### 2. Provides the chatbot API

The endpoint:
``` bash
POST /api/chat
```
receives the user's message and conversation history.

### 3. Communicates with Gemini

The backend uses:
``` json
const { GoogleGenAI } = require("@google/genai");
```
and creates the Gemini client using the API key stored in `.env.`

### Available Scripts

The project can be started with:
```bash
node chat.js
```
Your `package.json` can also contain:
```json
{
  "scripts": {
    "dev": "node chat.js"
  }
}
```
Then you can run:
```bash
npm run dev
```
Troubleshooting

`Cannot GET /`

Make sure your project structure is:
```bash
backend/
├── chat.js
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```
Then start the server from the `backend` folder:
```bash
node chat.js
```
Open:
```bash
http://localhost:3000
```
Do not open `index.html` directly.

`Cannot find module`

Run:
```bash
npm install
```
Then:
```bash
node chat.js
```
`Failed to get response from Gemini`

Check:

  1. Your `.env` file exists.
  2. The API key is valid.
  3. The environment variable name is correct.
  4. You have an internet connection.
  5. Check the terminal for the Gemini error.
#### Frontend says "Something went wrong connecting to the server"

Make sure the backend is running:
```bash
node chat.js
```
and that the browser is accessing:
```bash
http://localhost:3000
```
rather than opening the HTML file directly.

### Security
#### Never expose your Gemini API key

Do not write your API key in:
```bash
index.html
script.js
style.css
```
The API key should only exist in:
```bash
.env
```
The `.env` file should never be pushed to GitHub.

Use:
``` bash
.env
node_modules/
```
### Future Improvements

Possible improvements for future versions include:

- User authentication
- Persistent chat history
- MongoDB database integration
- Multiple conversations
- Conversation titles
- Markdown rendering
- Code syntax highlighting
- File uploads
- Image support
- Voice input
- Voice output
- Streaming Gemini responses
- Dark mode
- Chat export
- Message timestamps
- Delete individual conversations
- Deployment to a cloud platform
- Rate limiting
- Better API validation

### Project Status
```bash
Status: Working
Version: 1.0.0
```
The current version provides a functional frontend-to-backend chatbot connection using Express and Gemini.

### License

This project is intended for educational and personal project use.

You can add a different license later if you plan to publish or distribute the project.

### Quick Start

For a quick setup:
```bash
cd chatBot/backend
npm install
node chat.js
```
Then open:
``` bash
http://localhost:3000
```
Make sure your `.env` contains:
``` bash
GEMENI_API_KEY=your_gemini_api_key_here
```
And your frontend files are inside:
``` bash
backend/public/
```
```bash
backend/
├── chat.js
├── .env
├── package.json
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```
