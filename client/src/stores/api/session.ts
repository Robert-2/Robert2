import requester from '@/globals/requester';

import type { UserDetails } from '@/stores/api/users';

//
// - Constants
//

/** Contextes de l'application (Où se trouve l'utilisateur ?). */
export enum AppContext {
    /**
     * Back-office de l'application.
     * (= Partie accessible par les membres du staff).
     */
    INTERNAL = 'internal',
}

//
// - Types
//

export type Session = UserDetails & {
    language: string,
};

type NewSession = Session & {
    token: string,
};

export type Credentials = {
    identifier: string,
    password: string,
    context?: AppContext,
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
