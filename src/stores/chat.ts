import { create } from 'zustand'
import { Message, Conversation, AIModel } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  selectedModel: AIModel
  setConversations: (_conversations: Conversation[]) => void
  setCurrentConversation: (_conversation: Conversation | null) => void
  setMessages: (_messages: Message[]) => void
  addMessage: (_message: Message) => void
  setLoading: (_loading: boolean) => void
  setSelectedModel: (_model: AIModel) => void
}

export const useChatStore = create<ChatState>(set => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  selectedModel: 'gemini',
  setConversations: conversations => set({ conversations }),
  setCurrentConversation: conversation =>
    set({ currentConversation: conversation }),
  setMessages: messages => set({ messages }),
  addMessage: message =>
    set(state => ({ messages: [...state.messages, message] })),
  setLoading: loading => set({ isLoading: loading }),
  setSelectedModel: model => set({ selectedModel: model }),
}))
