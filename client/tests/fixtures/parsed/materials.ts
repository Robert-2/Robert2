import { dataFactory } from '@fixtures/@utils';
import inputMaterials from '../materials';
import { MaterialSchema, MaterialWithAvailabilitySchema } from '@/stores/api/materials';

import type { FactoryReturnType } from '@fixtures/@utils';
import type { Material, MaterialWithAvailability } from '@/stores/api/materials';

const asDefault: FactoryReturnType<Material> = dataFactory(
    MaterialSchema.array().parse(inputMaterials.default()),
);

const asWithAvailability: FactoryReturnType<MaterialWithAvailability> = dataFactory(
    MaterialWithAvailabilitySchema.array().parse(inputMaterials.withAvailability()),
);

export default {
    default: asDefault,
    withAvailability: asWithAvailability,
};
