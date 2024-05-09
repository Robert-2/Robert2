import 'vue-toasted';

declare module 'vue-toasted' {
    interface ToastOptions {
        duration?: number | null;
    }
}
