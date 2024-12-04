import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';

type Props = {
    /** Permet d'utiliser une présentation horizontale (= "à plat"). */
    horizontal?: boolean,

    /**
     * Permet d'utiliser une présentation minimaliste.
     *
     * Dans ce mode, seul le spinner sera affiché, pas de texte.
     */
    minimalist?: boolean,
};

type InstanceProperties = {
    shownTimer: ReturnType<typeof setTimeout> | undefined,
};

type Data = {
    shown: boolean,
};

/** Un indicateur de chargement. */
const Loading = defineComponent({
    name: 'Loading',
    props: {
        horizontal: {
            type: Boolean as PropType<Required<Props>['horizontal']>,
            default: false,
        },
        minimalist: {
            type: Boolean as PropType<Required<Props>['minimalist']>,
            default: false,
        },
    },
    setup: (): InstanceProperties => ({
        shownTimer: undefined,
    }),
    data: (): Data => ({
        shown: false,
    }),
    created() {
        // - Permet de reporter l'affichage du loading après 300ms pour éviter
        //   les flashs dans l'interface pour les loadings affichés très brièvement.
        this.shownTimer = setTimeout(() => { this.shown = true; }, 300);
    },
    beforeDestroy() {
        if (this.shownTimer) {
            clearTimeout(this.shownTimer);
        }
    },
    render() {
        const { $t: __, horizontal, minimalist, shown } = this;

        if (!shown) {
            return null;
        }

        const classNames = ['Loading', {
            'Loading--horizontal': horizontal,
            'Loading--minimalist': minimalist,
        }];

        return (
            <div class={classNames}>
                <svg class="Loading__spinner" viewBox="0 0 50 50">
                    <circle class="Loading__spinner__path" cx="25" cy="25" r="20" fill="none" />
                </svg>
                {!minimalist && <span class="Loading__text">{__('loading')}</span>}
            </div>
        );
    },
});

export default Loading;
