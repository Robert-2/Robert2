import type {
    SelectedMaterial,
    EmbeddedMaterial,
} from '../_types';

/**
 * Retourne la liste des quantités pour une sélection de matériel donnée.
 *
 * @param materials - La liste du matériel sélectionné.
 * @returns La liste des quantités et unités pour chaque matériel (et si applicable, par sous-listes).
 */
const getEmbeddedMaterialsQuantities = (materials: EmbeddedMaterial[]): SelectedMaterial[] => (
    materials.map(({ id, quantity }: EmbeddedMaterial) => (
        { id, quantity: quantity ?? 0 }
    ))
);

export default getEmbeddedMaterialsQuantities;
