#!/usr/bin/env node
// Simple script to validate the OpenAI key by calling the models endpoint.
// It reads the VITE_OPENAI_API_KEY from the project's .env file (without exporting it).
import fs from 'fs'
import path from 'path'

async function main() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env not found in project root')
    process.exit(2)
  }
  const env = fs.readFileSync(envPath, 'utf8')
  const match = env.match(/^VITE_OPENAI_API_KEY=(.+)$/m)
  if (!match) {
    console.error('VITE_OPENAI_API_KEY not found in .env')
    process.exit(3)
  }
  const key = match[1].trim()
  if (!key) {
    console.error('VITE_OPENAI_API_KEY appears empty')
    process.exit(4)
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) {
      console.error('OpenAI API responded with', res.status, res.statusText)
      const body = await res.text()
      console.error('Response body:', body)
      process.exit(5)
    }
    const data = await res.json()
    console.log('OpenAI key looks valid — models received:', Array.isArray(data.data) ? data.data.length : 'unknown')
    process.exit(0)
  } catch (err) {
    console.error('Network or fetch error:', err)
    process.exit(6)
  }
}

main()
