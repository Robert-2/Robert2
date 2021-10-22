import axios from 'axios';

import type { AxiosError } from 'axios';
import type { FormErrorDetail } from '@/stores/api/@types';

const isApiErrorCode = (error: unknown, code: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    return (error.response?.status === code);
};

const getValidationErrors = (error: unknown): FormErrorDetail | null => {
    if (!isApiErrorCode(error, 400)) {
        return null;
    }

    const { details } = (error as AxiosError).response?.data?.error || { details: {} };
    return details;
};

export { isApiErrorCode, getValidationErrors };
