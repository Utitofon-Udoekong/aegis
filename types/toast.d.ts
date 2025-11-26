interface ToastOptions {
  title: string
  message?: string
}

interface Toast {
  success: (options: ToastOptions | string) => void
  error: (options: ToastOptions | string) => void
  warning: (options: ToastOptions | string) => void
  info: (options: ToastOptions | string) => void
  close: () => void
}

declare module '#app' {
  interface NuxtApp {
    $toast: Toast
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: Toast
  }
}

export {}

