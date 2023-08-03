import type { Tag } from '@/stores/api/tags';
import type { Park } from '@/stores/api/parks';
import type { Category } from '@/stores/api/categories';
import type { Subcategory } from '@/stores/api/subcategories';
import type { Material } from '@/stores/api/materials';

export type Filters = {
    /** Recherche sur un nom de matériel ou une référence. */
    search: string | null,

    /**
     * Filtre sur le parc dans lequel sont situés les matériels.
     * (ou les unités de matériel lorsque le matériel est unitaire)
     */
    park: Park['id'] | null,

    /** Filtre sur la catégorie des matériels. */
    category: Category['id'] | 'uncategorized' | null,

    /** Filtre sur la sous-catégorie des matériels. */
    subCategory: Subcategory['id'] | null,

    /**
     * Filtre sur l'état de sélection des matériels.
     * (= n'affichera que le matériel qui a été sélectionné (avec une quantité > 0 donc)).
     */
    onlySelected: boolean,

    /** Filtre sur les tags des matériels (recherche de type `OR`). */
    tags: Array<Tag['id']>,
};

export type SelectedQuantities = {
    id: Material['id'],
    requested: number,
    available: number,
};

export type SelectedMaterial = {
    id: Material['id'],
    quantity: number,
};
