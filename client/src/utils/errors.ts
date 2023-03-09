import axios from 'axios';
import HttpCode from 'status-code-enum';

import type { AxiosError } from 'axios';
import type { I18nTranslate } from 'vuex-i18n';
import type { FormErrorDetail } from '@/stores/api/@types';

export const isRequestErrorStatusCode = (error: unknown, statusCode: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }
    return error.response?.status === statusCode;
};

export const getValidationErrors = (error: unknown): FormErrorDetail | null => {
    if (!isRequestErrorStatusCode(error, HttpCode.ClientErrorBadRequest)) {
        return null;
    }

    const { details } = (error as AxiosError).response?.data?.error || { details: {} };
    return details;
};

export const getErrorMessage = (error: unknown, __: I18nTranslate): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        const message = (error as Error).message || 'unknown';
        return __('errors.generic', { message });
    }

    const { status, data } = error.response || {
        status: HttpCode.ServerErrorInternal,
        data: undefined,
    };

    if (status === HttpCode.ClientErrorBadRequest) {
        return __('errors.validation');
    }

    if (status === HttpCode.ClientErrorNotFound) {
        return __('errors.record-not-found');
    }

    if (status === HttpCode.ClientErrorConflict) {
        return __('errors.already-exists');
    }

    return data?.error?.message ?? __('errors.unknown');
};
