# Quick Setup Guide

Follow these steps to get AI Interview Studio running on your machine:

## Step 1: Install Node.js

**Mac (using Homebrew):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

**Windows:**
Download from https://nodejs.org/

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 2: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd BESMART

# Install dependencies
npm install
```

## Step 3: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-proj-...`)
5. Add billing info at https://platform.openai.com/settings/organization/billing

## Step 4: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and paste your API key
# Replace 'your_openai_api_key_here' with your actual key
```

Your `.env` file should look like:
```
VITE_OPENAI_API_KEY=sk-proj-abc123...
```

## Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## Verify It's Working

1. You should see the AI Interview Studio homepage
2. Start an interview
3. Alex should speak (if you hear voice, it's working!)
4. Try the microphone button to test speech-to-text
5. Try the camera button to test video

## Common Issues

**"Voice playback failed"**
- Check your API key is correct in `.env`
- Make sure billing is set up on OpenAI
- Restart the dev server: `Ctrl+C` then `npm run dev`

**"Module not found"**
- Delete `node_modules` folder
- Run `npm install` again

**Port already in use**
- Kill the process using port 5173
- Or change the port in `vite.config.ts`

## Need Help?

Check the full README.md for detailed documentation!
