import { QueryClient } from 'vue-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10 * 60000, // - 10 minutes
            retry: (failureCount: number, error: unknown) => {
                // @ts-ignore - Ici, on sait que response existe.
                if (error.response.status === 404) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});

export default queryClient;
