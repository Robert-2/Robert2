import { dataFactory } from '@fixtures/@utils';
import inputCountries from '../countries';
import { CountrySchema } from '@/stores/api/countries';

import type { FactoryReturnType } from '@fixtures/@utils';
import type { Country } from '@/stores/api/countries';

const asDefault: FactoryReturnType<Country> = dataFactory(
    CountrySchema.array().parse(inputCountries.default()),
);

export default {
    default: asDefault,
};
