import HttpCode from 'status-code-enum';
import { QueryClient } from 'vue-query';
import { isRequestErrorStatusCode } from '@/utils/errors';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 10 * 60000, // - 10 minutes
            retry: (failureCount: number, error: unknown) => {
                if (isRequestErrorStatusCode(error, HttpCode.ClientErrorNotFound)) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});

export default queryClient;
