import { dataFactory } from '@fixtures/@utils';
import inputEvents from '../events';
import { EventDetailsSchema } from '@/stores/api/events';

import type { FactoryReturnType } from '@fixtures/@utils';
import type { EventDetails } from '@/stores/api/events';

const asDetails: FactoryReturnType<EventDetails> = dataFactory(
    EventDetailsSchema.array().parse(inputEvents.details()),
);

export default {
    details: asDetails,
};
