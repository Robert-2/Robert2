import { ref, onBeforeUnmount } from '@vue/composition-api';

import type { Ref } from '@vue/composition-api';

/**
 * Permet de récupérer le timestamp courant (équivalent à `Date.now()`).
 * Ce timestamp sera mis à jour toutes les minutes.
 *
 * @returns Le timestamp courant (voir `Date.now()`).
 */
const useNow = (): Ref<number> => {
    const now = ref(Date.now());

    // - Actualise le timestamp courant toutes les minutes.
    const nowTimer = setInterval(
        () => { now.value = Date.now(); },
        60_000,
    );

    onBeforeUnmount(() => {
        clearInterval(nowTimer);
    });

    return now;
};

export default useNow;
