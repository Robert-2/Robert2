import axios from 'axios';
import Config from '@/globals/config';
import Cookies from '@/utils/cookies';

const requester = axios.create({
    baseURL: Config.api.url,
    headers: Config.api.headers,
});

requester.interceptors.request.use(
    (_request) => {
        const { params, ...request } = _request;

        if (params) {
            Object.keys(params).forEach((name) => {
                if (params[name] === true) {
                    params[name] = '1';
                }
                if (params[name] === false) {
                    params[name] = '0';
                }
            });
            request.params = params;
        }

        const token = Cookies.get(Config.auth.cookie);
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => Promise.reject(error),
);

export default requester;
