import axios from 'axios';

const isApiErrorCode = (error, code) => {
    if (!axios.isAxiosError(error)) {
        return false;
    }
    return (error.response?.status === code);
};

const getValidationErrors = (error) => {
    if (!isApiErrorCode(error, 400)) {
        return null;
    }

    const { details } = error.response?.data?.error || { details: {} };
    return details;
};

const getErrorMessage = (error, __) => {
    if (typeof error === 'string') {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        const message = error.message || 'unknown';
        return __('errors.generic', { message });
    }

    const { status, data } = error.response || { status: 500, data: undefined };

    if (status === 400) {
        return __('errors.validation');
    }

    if (status === 404) {
        return __('errors.record-not-found');
    }

    if (status === 409) {
        return __('errors.already-exists');
    }

    return data?.error?.message ?? __('errors.unknown');
};

export { isApiErrorCode, getValidationErrors, getErrorMessage };
