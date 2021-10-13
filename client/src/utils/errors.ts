import axios from 'axios';

const isApiErrorCode = (error: unknown, code: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    return (error.response?.status === code);
};

const extractErrorDetails = (error: unknown): unknown => {
    if (!axios.isAxiosError(error)) {
        return error;
    }

    if (isApiErrorCode(error, 400)) {
        const { details } = error.response?.data?.error || { details: {} };
        return details;
    }

    return error;
};

export { isApiErrorCode, extractErrorDetails };
