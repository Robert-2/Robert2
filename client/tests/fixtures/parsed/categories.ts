import { dataFactory } from '@fixtures/@utils';
import inputCategories from '../categories';
import { CategorySchema } from '@/stores/api/categories';

import type { FactoryReturnType } from '@fixtures/@utils';
import type { Category } from '@/stores/api/categories';

const asDefault: FactoryReturnType<Category> = dataFactory(
    CategorySchema.array().parse(inputCategories.default()),
);

export default {
    default: asDefault,
};
