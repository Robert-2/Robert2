import type { MaterialState, State } from '../_types';

/**
 * Permet de savoir si le store est "vide", ou non.
 * (= si du matériel a été sélectionné, ou non)
 *
 * @param state - Le store actuel, contenant les quantités.
 *
 * @returns `true` si le store est vide, `false` sinon.
 */
const isEmpty = (state: State): boolean => (
    !Object.values(state.materials).some(
        (materialState: MaterialState) => (
            materialState.quantity > 0
        ),
    )
);

export default isEmpty;
