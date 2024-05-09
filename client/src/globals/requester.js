import axios from 'axios';
import deepObjectSet from 'lodash/set';
import isPlainObject from 'lodash/isPlainObject';
import flattenObject from '@/utils/flattenObject';
import config from '@/globals/config';
import cookies from '@/utils/cookies';
import DateTime from '@/utils/datetime';
import Day from '@/utils/day';

const requester = axios.create({
    baseURL: config.api.url,
    headers: config.api.headers,
});

requester.interceptors.request.use(
    (_request) => {
        const { params, onProgress, ...request } = _request;

        // - Ajoute une méthode haut-niveau permettant de récupérer l'avancement sous forme numérique.
        //   - Si la méthode de la requête est POST, PUT ou PATCH, c'est l'événement `onUploadProgress` qui sera écouté.
        //   - Sinon ce sera `onDownloadProgress`
        if (onProgress) {
            const progressCallback = (event) => {
                if (!event.lengthComputable) {
                    return;
                }

                const { loaded, total } = event;
                const percent = (loaded / total) * 100;
                onProgress(percent);
            };

            if (request.method && ['POST', 'PUT', 'PATCH'].includes(request.method.toUpperCase())) {
                request.onUploadProgress = progressCallback;
            } else {
                request.onDownloadProgress = progressCallback;
            }
        }

        // - Traitement spécial des objets littéraux contenant des fichiers.
        //   => On utilise un envoi via `multipart/form-data` et on met les données
        //      supplémentaires éventuelles dans une clé spéciale `@data`)
        const hasFiles = (
            isPlainObject(request.data) &&
            Object.values(request.data).some((value) => (
                value instanceof File
            ))
        );
        if (hasFiles) {
            const formData = new FormData();
            const data = Object.entries(flattenObject(request.data)).reduce(
                (_data, [key, value]) => {
                    if (value instanceof File) {
                        formData.append(btoa(key), value);
                        return _data;
                    }
                    return deepObjectSet(_data, key, value);
                },
                {},
            );

            formData.append('@data', JSON.stringify(data));
            request.data = formData;
        }

        if (params) {
            Object.keys(params).forEach((name) => {
                if (params[name] === true) {
                    params[name] = '1';
                }
                if (params[name] === false) {
                    params[name] = '0';
                }
                if (params[name] instanceof DateTime || params[name] instanceof Day) {
                    params[name] = params[name].toString();
                }
            });
            request.params = params;
        }

        const token = cookies.get(config.auth.cookie);
        if (token) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => Promise.reject(error),
);

export default requester;
