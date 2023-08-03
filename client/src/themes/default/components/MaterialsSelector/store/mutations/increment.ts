import type { MaterialWithAvailabilities as Material } from '@/stores/api/materials';
import type { State } from '../_types';

type Payload = {
    /**
     * Le matériel (avec quantités disponibles) dont on veut
     * ajouter 1 quantité dans le store.
     */
    material: Material,
};

/**
 * Permet d'ajouter 1 quantité à un matériel du store.
 *
 * - S'il n'existe pas encore, il sera ajouté avec une quantité de 1.
 * - Si c'est un matériel unitaire, la prochaine unité "interne" disponible
 *   sera automatiquement sélectionnée.
 *
 * NOTE: Cette fonction mute le state passé en paramètre !
 *
 * @param state - Le state qui sera muté avec la nouvelle quantité pour le matériel.
 * @param payload - Un object contenant les informations du matériel que l'on veut ajouter.
 *                  (@see {@link Payload})
 */
const increment = (state: State, payload: Payload): void => {
    const { material } = payload;
    const { id } = material;

    if (!state.materials[id]) {
        state.materials = {
            ...state.materials,
            [id]: {
                quantity: 0,
            },
        };
    }
    const materialState = state.materials[id];
    materialState.quantity += 1;
};

export default increment;
