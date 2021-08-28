import axios from 'axios';
import Config from '@/globals/config';
import Cookies from '@/utils/cookies';

const requester = axios.create({
    baseURL: Config.api.url,
    headers: Config.api.headers,
});

requester.interceptors.request.use(
    (_request) => {
        const request = { ..._request };
        const token = Cookies.get(Config.auth.cookie);
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => Promise.reject(error),
);

export default requester;
