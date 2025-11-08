# AI Interview Studio

A React + TypeScript application that provides interactive technical interview practice with AI-powered voice feedback, speech-to-text, and video recording.

## Features

- 🎙️ **AI Voice Interviewer** - Alex speaks questions using OpenAI TTS
- 🎤 **Speech-to-Text** - Answer questions by speaking using Whisper AI
- � **Videlo Recording** - Practice with your camera on for realistic interview experience
- � **Real-tipme Feedback** - Instant scoring and detailed analysis
- 🚀 **Multiple Roles** - Frontend, Backend, Full Stack, Data, ML Engineer
- 📊 **Detailed Grading** - Precise scoring based on keywords, structure, and technical depth
- 🎯 **Difficulty Levels** - Entry, Mid, and Senior level questions
- ⚡ **Modern UI** - Fast and responsive with Framer Motion animations

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **OpenAI API Key** (for voice features)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd BESMART
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-proj-your_actual_api_key_here
```

**Get your API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file
5. Add billing information (OpenAI provides free credits to start)

**Important:** Never commit your `.env` file to version control! It's already in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

## Usage

1. **Select Your Role** - Choose the position you're interviewing for
2. **Choose Difficulty** - Entry, Mid, or Senior level
3. **Set Duration** - How long you want to practice
4. **Start Interview** - Alex will introduce herself and begin asking questions
5. **Answer Questions** - Type or use the microphone button to speak your answers
6. **Enable Camera** (Optional) - Click the camera button to practice with video
7. **Get Feedback** - Receive instant scoring and detailed feedback after each answer
8. **Review Results** - See your overall performance and areas for improvement

## Features in Detail

### Voice Features
- **Text-to-Speech**: Alex speaks all questions and feedback at 1.15x speed
- **Speech-to-Text**: Click the microphone button to record your answer, click again to transcribe

### Grading System
Answers are scored on:
- **Keyword Coverage** (25 points) - Technical terminology and key concepts
- **Length & Detail** (20 points) - Comprehensive explanations (75+ words recommended)
- **Structure** (20 points) - Organization, examples, and comparisons
- **Technical Depth** (20 points) - Implementation details and specific technologies
- **Problem-Solving** (15 points) - Reasoning, trade-offs, and analytical thinking

### Camera
- Click the video button to enable your camera
- See yourself live during the interview
- Practice maintaining eye contact and professional presence

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **OpenAI API** - TTS (text-to-speech) and Whisper (speech-to-text)
- **Lucide React** - Icons

## Troubleshooting

### Voice not working
- Make sure you have a valid OpenAI API key in `.env`
- Check that you have billing set up on your OpenAI account
- Restart the dev server after adding the API key
- Check browser console (F12) for error messages

### Camera not showing
- Allow camera permissions when prompted
- Check browser settings to ensure camera access is enabled
- Try refreshing the page

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Make sure you're using Node.js v16 or higher

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
