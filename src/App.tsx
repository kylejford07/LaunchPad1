import React from 'react'
import AIInterviewStudio from './components/AIInterviewStudio'

export default function App() {
  // Quick runtime check — prints whether a VITE key is present (does not log the key)
  // This helps verify the env is visible in the browser during development.
  if (typeof window !== 'undefined') {
    // show simple boolean in console so user can confirm without exposing the key
    // eslint-disable-next-line no-console
    console.log('VITE key present?', Boolean(import.meta.env.VITE_OPENAI_API_KEY));
  }
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <AIInterviewStudio />
    </div>
  )
}
