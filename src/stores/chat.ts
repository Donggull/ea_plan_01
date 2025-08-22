import { create } from 'zustand'
import { Message, Conversation, AIModel } from '@/types'

interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  selectedModel: AIModel
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: Conversation | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setSelectedModel: (model: AIModel) => void
}

export const useChatStore = create<ChatState>(set => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  selectedModel: 'gemini',
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set(state => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}))
