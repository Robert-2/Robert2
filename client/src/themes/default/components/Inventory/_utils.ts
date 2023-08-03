import stringCompare from '@/utils/stringCompare';

import type { Material } from '@/stores/api/materials';
import type { Category } from '@/stores/api/categories';
import type { ParkSummary as Park } from '@/stores/api/parks';

/* eslint-disable @typescript-eslint/naming-convention */
export type AwaitedMaterial = Material & {
    awaited_quantity: number,
};
/* eslint-enable @typescript-eslint/naming-convention */

export type AwaitedMaterialGroup<G extends Category | Park = Category | Park> = (
    & (
        | { id: G['id'], name: G['name'] }
        | { id: null, name: null }
    )
    & { materials: AwaitedMaterial[] }
);

export const groupByCategories = (
    materials: AwaitedMaterial[],
    categories: Category[],
): Array<AwaitedMaterialGroup<Category>> => {
    if (materials.length === 0) {
        return [];
    }

    const sections = new Map<Category['id'] | null, AwaitedMaterialGroup<Category>>();

    materials.forEach((material: AwaitedMaterial) => {
        const { id: categoryId = null, name: categoryName = null } = (
            material.category_id !== null
                ? (categories.find(({ id }: Category) => id === material.category_id) ?? {})
                : {}
        );

        if (!sections.has(categoryId)) {
            const group = {
                id: categoryId,
                name: categoryName,
                materials: [],
            } as AwaitedMaterialGroup<Category>;
            sections.set(categoryId, group);
        }

        const section = sections.get(categoryId);
        section!.materials.push(material);
    });

    const result = Array.from(sections.values());

    result.sort((a: AwaitedMaterialGroup<Category>, b: AwaitedMaterialGroup<Category>) => (
        stringCompare(a.name ?? '', b.name ?? '')
    ));
    result.forEach((section: AwaitedMaterialGroup<Category>) => {
        section.materials.sort((a: AwaitedMaterial, b: AwaitedMaterial) => (
            stringCompare(a.name, b.name)
        ));
    });

    return result;
};

// export const groupByParks = (
//     materials: AwaitedMaterial[],
//     parks: Park[],
// ): Array<AwaitedMaterialGroup<Park>> => {
//     if (materials.length === 0) {
//         return [];
//     }

//     const sections = new Map<Category['id'] | null, AwaitedMaterialGroup<Park>>();

//     materials.forEach((material: AwaitedMaterial) => {
//         const { id: parkId = null, name: parkName = null } = (
//             parks.find(({ id }: Park) => id === material.park_id) ?? {}
//         );

//         if (!sections.has(parkId)) {
//             const group = {
//                 id: parkId,
//                 name: parkName,
//                 materials: [],
//             } as AwaitedMaterialGroup<Park>;
//             sections.set(parkId, group);
//         }

//         const section = sections.get(parkId);
//         section!.materials.push(material);
//     });

//     const result = Array.from(sections.values());

//     result.sort((a, b) => (
//         stringCompare(a.name ?? '', b.name ?? '')
//     ));

//     result.forEach((section) => {
//         section.materials.sort((a, b) => (
//             stringCompare(a.name, b.name)
//         ));
//     });

//     return result;
// };
