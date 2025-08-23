'use client'

import ChatInterface from '@/components/ai/ChatInterface'

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        <ChatInterface />
      </div>
    </div>
  )
}