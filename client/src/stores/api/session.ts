import requester from '@/globals/requester';

import type { UserDetails } from '@/stores/api/users';

//
// - Types
//

type Session = UserDetails & {
    language: string,
};

type NewSession = Session & {
    token: string,
};

type Credentials = {
    identifier: string,
    password: string,
};

//
// - Fonctions
//

const get = async (): Promise<Session> => (
    (await requester.get('/session')).data
);

const create = async (credentials: Credentials): Promise<NewSession> => (
    (await requester.post('/session', credentials)).data
);

export default { get, create };
