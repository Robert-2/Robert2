import Axios from 'axios';
import Config from '@/config/globalConfig';
import Cookies from '@/utils/cookies';

const axios = Axios.create({
    baseURL: Config.api.url,
    headers: Config.api.headers,
});

axios.interceptors.request.use(
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

export default axios;
