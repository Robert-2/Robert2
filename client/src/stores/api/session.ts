import { z } from '@/utils/validation';
import requester from '@/globals/requester';
import { UserDetailsSchema, UserSettingsSchema } from './users';

import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

/** Contextes de l'application (Où se trouve l'utilisateur ?). */
export enum AppContext {
    /**
     * Back-office de l'application.
     * (= Partie accessible par les membres du staff).
     */
    INTERNAL = 'internal',
}

const SessionSchema = UserDetailsSchema.merge(UserSettingsSchema);

const NewSessionSchema = SessionSchema.extend({
    token: z.string(),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type Session = SchemaInfer<typeof SessionSchema>;

type NewSession = SchemaInfer<typeof NewSessionSchema>;

//
// - Edition
//

export type Credentials = {
    identifier: string,
    password: string,
    context?: AppContext,
};

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const get = async (): Promise<Session> => {
    const response = await requester.get('/session');
    return SessionSchema.parse(response.data);
};

const create = async (credentials: Credentials): Promise<NewSession> => {
    const response = await requester.post('/session', credentials);
    return NewSessionSchema.parse(response.data);
};

export default { get, create };
