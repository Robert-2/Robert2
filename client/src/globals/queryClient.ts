import { QueryClient } from 'vue-query';
import { isApiErrorCode } from '@/utils/errors';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10 * 60000, // - 10 minutes
            retry: (failureCount: number, error: unknown) => {
                if (isApiErrorCode(error, 404)) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});

export default queryClient;
