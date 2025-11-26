import { h } from 'vue'
import Toast from '~/components/ui/Toast.vue'

interface ToastOptions {
  title: string
  message?: string
}

export interface ToastService {
  success: (options: ToastOptions | string) => void
  error: (options: ToastOptions | string) => void
  warning: (options: ToastOptions | string) => void
  info: (options: ToastOptions | string) => void
  close: () => void
}

declare module '#app' {
  interface NuxtApp {
    $toast: ToastService
  }
}

export default defineNuxtPlugin(() => {
  const theme = {
    containerId: 'toast-container',
    containerClass: [
      'fixed',
      'bottom-0',
      'right-0',
      'z-50',
      'pointer-events-none',
      'p-4',
      'flex',
      'flex-col',
      'items-end',
      'gap-3',
      'max-w-sm',
      'w-full',
    ],
    wrapperClass: [
      'pointer-events-auto',
      'w-full',
    ],
  }

  const nt = createNinjaToaster({
    theme,
    maxToasts: 5,
    duration: 4000,
    pauseOnHover: true,
    transition: {
      enterActiveClass: 'transition duration-300 ease-out',
      enterFromClass: 'transform translate-x-full opacity-0',
      enterToClass: 'transform translate-x-0 opacity-100',
      leaveActiveClass: 'transition duration-200 ease-in',
      leaveFromClass: 'transform translate-x-0 opacity-100',
      leaveToClass: 'transform translate-x-full opacity-0',
    },
  })

  const toast: ToastService = {
    success(options: ToastOptions | string) {
      const opts = typeof options === 'string' ? { title: options } : options
      nt.show(() => h(Toast, { ...opts, type: 'success' }))
    },
    error(options: ToastOptions | string) {
      const opts = typeof options === 'string' ? { title: options } : options
      nt.show(() => h(Toast, { ...opts, type: 'error' }))
    },
    warning(options: ToastOptions | string) {
      const opts = typeof options === 'string' ? { title: options } : options
      nt.show(() => h(Toast, { ...opts, type: 'warning' }))
    },
    info(options: ToastOptions | string) {
      const opts = typeof options === 'string' ? { title: options } : options
      nt.show(() => h(Toast, { ...opts, type: 'info' }))
    },
    close() {
      nt.closeAll()
    },
  }

  return {
    provide: {
      toast,
    },
  }
})
