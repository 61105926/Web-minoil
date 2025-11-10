import { ref } from 'vue'

interface ToastOptions {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: number
}

const toasts = ref<ToastItem[]>([])
let toastId = 0

export function useToast() {
  const show = (options: ToastOptions) => {
    const id = toastId++
    const toast: ToastItem = {
      ...options,
      id,
    }
    toasts.value.push(toast)

    // Auto-remover después de la duración
    if (toast.duration !== 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration || 5000)
    }

    return id
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title: string, message?: string) => {
    return show({ variant: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    return show({ variant: 'error', title, message })
  }

  const warning = (title: string, message?: string) => {
    return show({ variant: 'warning', title, message })
  }

  const info = (title: string, message?: string) => {
    return show({ variant: 'info', title, message })
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
  }
}

