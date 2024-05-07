import type { SelectedMaterial } from '../../_types';
import type { MaterialState, State } from '../_types';

/**
 * Retourne une fonction permettant d'exporter le store.
 *
 * @param state - Le store actuel, contenant les quantités.
 *
 * @returns Une fonction permettant de récupérer les données du store, formatées.
 */
/* eslint-disable @stylistic/ts/lines-around-comment */
const exportData = (state: State) => (
    /**
     * Permet de récupérer les données du store, formatées.
     *
     * @returns Les données du store, formatées.
     */
    (): SelectedMaterial[] => (
        Object.entries(state.materials)
            .filter(([, materialState]: [string, MaterialState]) => materialState.quantity > 0)
            .map(([id, materialState]: [string, MaterialState]): SelectedMaterial => ({
                id: parseInt(id, 10),
                quantity: materialState.quantity,
            }))
    )
);
/* eslint-enable @stylistic/ts/lines-around-comment */

export default exportData;
