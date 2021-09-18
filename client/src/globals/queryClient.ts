import { QueryClient } from 'vue-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10 * 60000, // - 10 minutes.
        },
    },
});

export default queryClient;
