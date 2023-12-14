import requester from '@/globals/requester';

import type { Merge } from 'type-fest';

//
// - Types
//

export enum MaterialDisplayMode {
    CATEGORIES = 'categories',
    SUB_CATEGORIES = 'sub-categories',
    PARKS = 'parks',
    FLAT = 'flat',
}

export enum ReturnInventoryMode {
    START_EMPTY = 'start-empty',
    START_FULL = 'start-full',
}

export type Settings = {
    eventSummary: {
        customText: {
            title: string | null,
            content: string | null,
        },
        materialDisplayMode: MaterialDisplayMode,
        showLegalNumbers: boolean,
    },
    calendar: {
        event: {
            showLocation: boolean,
            showBorrower: boolean,
        },
        public: (
            | { enabled: true, url: string }
            | { enabled: false }
        ),
    },
    returnInventory: {
        mode: ReturnInventoryMode,
    },
};

type SettingsEdit = Partial<Merge<Settings, {
    calendar: (
        & Omit<Settings['calendar'], 'public'>
        & { public: { enabled: boolean } }
    ),
}>>;

//
// - Fonctions
//

const all = async (): Promise<Settings> => (
    (await requester.get('/settings')).data
);

const update = async (data: SettingsEdit): Promise<Settings> => (
    (await requester.put('/settings', data)).data
);

const reset = async (key: string): Promise<Settings> => (
    (await requester.delete(`/settings/${key}`)).data
);

export default { all, update, reset };
