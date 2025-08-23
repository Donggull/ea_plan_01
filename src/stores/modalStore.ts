import { create } from 'zustand'

interface ModalState {
  isCreateProjectModalOpen: boolean
  openCreateProjectModal: () => void
  closeCreateProjectModal: () => void
}

export const useModalStore = create<ModalState>(set => ({
  isCreateProjectModalOpen: false,
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
}))
