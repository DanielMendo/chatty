import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'
import { useAuthStore } from './useAuthStore'

export const useChatStore = create((set, get) => ({
    users: [],
    messages: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    setSelectedUser: (selectedUser) => {
        set({ selectedUser: selectedUser })
    },

    getUsers: async () => {
        set({ isUsersLoading: true })

        try {
            const res = await axiosInstance.get("/message/users")
            set({ users: res.data })
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            set({ isUsersLoading: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true })

        try {
            const res = await axiosInstance.get(`/message/${userId}`)
            set({ messages: res.data })
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData)
            set({ messages: [...messages, res.data] })
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket

        socket.on("newMessage", newMessage => {
            if (newMessage.senderId !== selectedUser._id) return
            set({ messages: [...get().messages, newMessage] })
        })
    },

    unsubscribeFromMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return
        
        const socket = useAuthStore.getState().socket
        socket.off("newMessage")
    }
}))