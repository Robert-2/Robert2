declare module 'axios' {
    export type ProgressCalback = (percent: number) => void;

    // TODO: Overwriter ça uniquement dans le custom requester et non globalement.
    interface AxiosRequestConfig {
        onProgress?(percent: number): void;
    }
}
