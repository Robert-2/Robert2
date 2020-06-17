/* eslint-disable import/no-cycle */
import Axios from 'axios';
import Config from '@/config/globalConfig';
import Auth from '@/auth';

const axios = Axios.create({
  baseURL: Config.api.url,
  headers: Config.api.headers,
});

axios.interceptors.request.use(
  (_request) => {
    const request = { ..._request };
    const token = window.sessionStorage.getItem('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || { status: 0 };
    if (status === 401) {
      Auth.logout({ mode: 'expired' });
    }
    return Promise.reject(error);
  },
);

export default axios;
