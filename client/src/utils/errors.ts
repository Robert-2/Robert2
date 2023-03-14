/* eslint-disable import/prefer-default-export */

import axios from 'axios';

export const isRequestErrorStatusCode = (error: unknown, statusCode: number): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }
    return error.response?.status === statusCode;
};
