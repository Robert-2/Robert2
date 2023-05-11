import requester from '@/globals/requester';

//
// - Types
//

export type MaterialDisplayMode = 'categories' | 'sub-categories' | 'parks' | 'flat';

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
    },
    returnInventory: {
        mode: ReturnInventoryMode,
    },
};

//
// - Fonctions
//

const all = async (): Promise<Settings> => (
    (await requester.get('/settings')).data
);

const update = async (data: Partial<Settings>): Promise<Settings> => (
    (await requester.put('/settings', data)).data
);

const reset = async (key: string): Promise<Settings> => (
    (await requester.delete(`/settings/${key}`)).data
);

export default { all, update, reset };
