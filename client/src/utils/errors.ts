import axios from 'axios';

import type { FormErrorDetail } from '@/stores/api/@types';

const isApiErrorCode = (error: unknown, code: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    return (error.response?.status === code);
};

const extractErrorDetails = (error: unknown): FormErrorDetail | null => {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    if (!isApiErrorCode(error, 400)) {
        return null;
    }

    const { details } = error.response?.data?.error || { details: {} };
    return details;
};

export { isApiErrorCode, extractErrorDetails };
