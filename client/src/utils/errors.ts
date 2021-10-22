import Vue from 'vue';
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

const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') {
        return error;
    }

    // FIXME: Trouver un moyen de typer ceci correctement ↓
    // @ts-ignore Ici, i18n est bien défini.
    const { translate: __ } = Vue.i18n;

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
