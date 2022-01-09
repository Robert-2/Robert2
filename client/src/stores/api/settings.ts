import requester from '@/globals/requester';

//
// - Types
//

type MaterialDisplayMode = 'categories' | 'sub-categories' | 'parks' | 'flat';

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
};

//
// - Functions
//

const all = async (): Promise<Settings> => (
    (await requester.get('settings')).data
);

const put = async (data: Partial<Settings>): Promise<Settings> => (
    (await requester.put('settings', data)).data
);

export default { all, put };
