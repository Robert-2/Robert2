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

type I18nTranslate = (msg: string, vars?: Record<string, string | number>) => string;

const getErrorMessage = (error: unknown, __: I18nTranslate): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        const message = (error as Error).message || 'unknown';
        return __('errors.generic', { message });
    }

    const { status, data } = error.response || { status: 500, data: undefined };

    if (status === 400) {
        return __('errors.validation');
    }

    if (status === 404) {
        return __('errors.not-found');
    }

    if (status === 409) {
        return __('errors.already-exists');
    }

    return data?.error?.message ?? __('errors.unknown');
};

export { isApiErrorCode, getValidationErrors, getErrorMessage };
