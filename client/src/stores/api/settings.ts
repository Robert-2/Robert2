import requester from '@/globals/requester';
import { z } from '@/utils/validation';

import type { OmitDeep, PartialDeep } from 'type-fest';
import type { SchemaInfer } from '@/utils/validation';

// ------------------------------------------------------
// -
// -    Schema / Enums
// -
// ------------------------------------------------------

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

export enum PublicCalendarPeriodDisplay {
    /** Les périodes d'opération uniquement sont affichées. */
    OPERATION = 'operation',

    /** Les périodes de mobilisation uniquement sont affichées. */
    MOBILIZATION = 'mobilization',

    /** Les périodes de mobilisation et d'opération sont affichées. */
    BOTH = 'both',
}

const OpeningDaySchema = z.strictObject({
    weekday: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^(?:0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]:[0-5][0-9]$/),
    end_time: z.string().regex(/^(?:0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]:[0-5][0-9]$/),
});

const SettingsSchema = z.strictObject({
    general: z.strictObject({
        openingHours: OpeningDaySchema.array(),
    }),
    eventSummary: z.strictObject({
        customText: z.strictObject({
            title: z.string().nullable(),
            content: z.string().nullable(),
        }),
        materialDisplayMode: z.nativeEnum(MaterialDisplayMode),
        showLegalNumbers: z.boolean(),
        showReplacementPrices: z.boolean(),
        showDescriptions: z.boolean(),
        showTags: z.boolean(),
        showPictures: z.boolean(),
    }),
    calendar: z.strictObject({
        event: z.strictObject({
            showLocation: z.boolean(),
            showBorrower: z.boolean(),
        }),
        public: z.discriminatedUnion('enabled', [
            z.strictObject({
                enabled: z.literal(true),
                url: z.string().nullable().optional(),
                displayedPeriod: z.nativeEnum(PublicCalendarPeriodDisplay),
            }),
            z.strictObject({
                enabled: z.literal(false),
            }),
        ]),
    }),
    returnInventory: z.strictObject({
        mode: z.nativeEnum(ReturnInventoryMode),
    }),
});

// ------------------------------------------------------
// -
// -    Types
// -
// ------------------------------------------------------

export type OpeningDay = SchemaInfer<typeof OpeningDaySchema>;

export type Settings = SchemaInfer<typeof SettingsSchema>;

//
// - Edition
//

export type SettingsEdit = PartialDeep<OmitDeep<Settings, 'calendar.public.url'>>;

// ------------------------------------------------------
// -
// -    Fonctions
// -
// ------------------------------------------------------

const all = async (): Promise<Settings> => {
    const response = await requester.get('/settings');
    return SettingsSchema.parse(response.data);
};

const update = async (data: SettingsEdit): Promise<Settings> => {
    const response = await requester.put('/settings', data);
    return SettingsSchema.parse(response.data);
};

const reset = async (key: string): Promise<Settings> => {
    const response = await requester.delete(`/settings/${key}`);
    return SettingsSchema.parse(response.data);
};

export default { all, update, reset };
