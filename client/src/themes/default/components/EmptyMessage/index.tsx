import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';

// - Illustrations
import SearchIllustration from './illustrations/search.svg?inline';
import GeneralIllustration from './illustrations/general.svg?inline';

import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

const ILLUSTRATIONS = {
    general: GeneralIllustration,
    search: SearchIllustration,
} as const;

type Action = {
    /** Le contenu à afficher dans le bouton d'action. */
    label: string,

    /** Le type de bouton d'action à utiliser. */
    type?: string,

    /**
     * L'éventuel icône à utiliser avant le texte de l'action.
     *
     * Doit contenir une chaîne de caractère avec les composantes suivantes séparées par `:`:
     * - Le nom de l'icône sous forme de chaîne (e.g. `plus`, `wrench`)
     *   Pour une liste exhaustive des codes, voir: https://fontawesome.com/v5.15/icons?m=free
     * - La variante à utiliser de l'icône à utiliser (`solid`, `regular`, ...).
     *
     * @example
     * - `wrench`
     * - `wrench:solid`
     */
    icon?: string | `${string}:${Required<IconProps>['variant']}`,

    /**
     * Si l'action est un lien, la cible du lien sous forme de chaîne,
     * ou d'objet `Location` compatible avec Vue-Router.
     *
     * Si non définie, un élément HTML `<button>` sera utilisé et
     * vous devriez écouter l'événement `onClick` pour réagir au click.
     */
    target?: string | Location,

    /**
     * Si l'action secondaire est un lien, permet d'indiquer que c'est un lien externe.
     *
     * Si c'est le cas, le fonctionnement sera le suivant:
     * - Le routing interne ("Vue Router"), ne sera pas utilisé.
     *   (Il ne faut donc pas passer d'objet à `target` mais bien une chaîne)
     * - Si c'est une URL absolue, celle-ci s'ouvrira dans une autre fenêtre / onglet.
     */
    external?: boolean,

    /**
     * Fonction à utiliser lors d'un clic sur le bouton d'action.
     *
     * N'est utile que quand l'action n'est pas un lien.
     */
    onClick?(e: MouseEvent): void,
};

type Props = {
    /**
     * Le type de message.
     *
     * Ceci servira surtout à customiser l'illustration affichée.
     * Si cette prop. n'est pas définie, une illustration généraliste sera utilisée.
     */
    type?: keyof typeof ILLUSTRATIONS,

    /**
     * Permet de customiser le message affiché pour
     * signifier l'absence de données.
     */
    message?: string,

    /**
     * La taille globale du block.
     *
     * Variantes disponibles:
     * - `normal`: Typiquement à utiliser comme message global de page.
     * - `small`: Pour des zones plus petites, comme le contenu d'un tableau.
     */
    size?: 'small' | 'normal',

    /**
     * Une éventuelle action à afficher en dessous du message.
     *
     * Celle-ci doit être passée sous forme d'un objet.
     * Voir le type {@link Action} pour plus de détails.
     */
    action?: Action,
};

/**
 * Un élément d’interface permettant d'indiquer l'absence de données.
 * (que ce soit dans une liste, une page, ou autre)
 */
const EmptyMessage = defineComponent({
    name: 'EmptyMessage',
    props: {
        type: {
            type: String as PropType<Required<Props>['type']>,
            default: 'general',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                Object.keys(ILLUSTRATIONS).includes(value)
            ),
        },
        message: {
            type: String as PropType<Props['message']>,
            default: undefined,
        },
        size: {
            type: String as PropType<Required<Props>['size']>,
            default: 'normal',
            validator: (value: unknown) => (
                typeof value === 'string' &&
                ['small', 'normal'].includes(value)
            ),
        },
        action: {
            type: Object as PropType<Props['action']>,
            default: undefined,
        },
    },
    render() {
        const { $t: __, message, size, action } = this;
        const Illustration = ILLUSTRATIONS[this.type];

        const renderAction = (): JSX.Element | null => {
            if (!action) {
                return null;
            }
            const {
                icon,
                label,
                target,
                type = 'add',
                external = false,
                onClick,
            } = action;

            return (
                <Button
                    size={size}
                    icon={icon}
                    type={type}
                    to={target}
                    external={external}
                    onClick={onClick ?? (() => {})}
                    class="EmptyMessage__action"
                >
                    {label}
                </Button>
            );
        };

        return (
            <div class={['EmptyMessage', `EmptyMessage--${size}`]}>
                <Illustration class="EmptyMessage__illustration" />
                <p class="EmptyMessage__message">{message ?? __('empty-state')}</p>
                {renderAction()}
            </div>
        );
    },
});

export default EmptyMessage;
