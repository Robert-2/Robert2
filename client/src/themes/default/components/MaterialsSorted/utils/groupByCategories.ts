import invariant from 'invariant';
import stringCompare from '@/utils/stringCompare';
import getMaterialQuantity from './getMaterialQuantity';
import getMaterialUnitPrice from './getMaterialUnitPrice';

import type { BookingMaterial } from './_types';
import type { Category } from '@/stores/api/categories';

export type MaterialsSection = {
    id: Category['id'] | null,
    name: Category['name'] | null,
    materials: BookingMaterial[],
};

const groupByCategories = (
    materials: BookingMaterial[],
    categories: Category[],
    sortBy: 'price' | 'name' = 'name',
): MaterialsSection[] => {
    if (materials.length === 0) {
        return [];
    }

    const sections = new Map<Category['id'] | null, MaterialsSection>();

    materials.forEach((material: BookingMaterial) => {
        const { id: categoryId = null, name: categoryName = null } = (
            material.category_id !== null
                ? (categories.find(({ id }: Category) => id === material.category_id) ?? {})
                : {}
        );

        if (!sections.has(categoryId)) {
            sections.set(categoryId, {
                id: categoryId,
                name: categoryName,
                materials: [],
            });
        }

        const section = sections.get(categoryId);
        section!.materials.push(material);
    });

    const result = Array.from(sections.values());

    result.sort((a: MaterialsSection, b: MaterialsSection) => (
        stringCompare(a.name ?? '', b.name ?? '')
    ));
    result.forEach((section: MaterialsSection) => {
        section.materials.sort((a: BookingMaterial, b: BookingMaterial) => {
            invariant(
                ['price', 'name'].includes(sortBy),
                `La clé de tri "${sortBy}" n'est pas prise en charge.`,
            );

            if (sortBy === 'price') {
                const subtotalA = getMaterialUnitPrice(a) * getMaterialQuantity(a);
                const subtotalB = getMaterialUnitPrice(b) * getMaterialQuantity(b);
                return subtotalA > subtotalB ? -1 : 1;
            }

            return stringCompare(a.name, b.name);
        });
    });

    return result;
};

export default groupByCategories;
