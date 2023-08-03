import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';

import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

export type Props = {
    /**
     * L'icône à utiliser avant le texte de l'élément.
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
    icon: string | `${string}:${Required<IconProps>['variant']}`,

    /** L'intitulé de l'élément. */
    label: string,

    /**
     * La cible de l'élément sous forme de chaîne ou d'objet `Location` compatible avec Vue-Router.
     *
     * Si non définie, un élément HTML `<button>` sera utilisé et
     * vous devriez écouter l'événement `onClick` pour réagir au click.
     */
    to?: string | Location,

    /**
     * Permet d'indiquer que la cible de l'élément est "externe".
     *
     * Si c'est le cas, le component fonctionnera comme suit:
     * - Le routing interne ("Vue Router"), ne sera pas utilisé.
     *   (Il ne faut donc pas passer d'objet à `to` mais bien une chaîne)
     * - Si c'est une URL absolue, celle-ci s'ouvrira dans une autre fenêtre / onglet.
     */
    external?: boolean,

    /** L'éventuelle fonction à utiliser lors d'un clic sur l'élément. */
    onClick?(e: MouseEvent): void,
};

// @vue/component
const DefaultLayoutHeaderDropdownItem = defineComponent({
    name: 'DefaultLayoutHeaderDropdownItem',
    props: {
        icon: {
            type: String as PropType<Required<Props>['icon']>,
            required: true,
        },
        label: {
            type: String as PropType<Required<Props>['label']>,
            required: true,
        },
        to: {
            type: [String, Object] as PropType<Props['to']>,
            default: undefined,
        },
        external: {
            type: Boolean as PropType<Required<Props>['external']>,
            default: false,
        },
    },
    emits: ['click'],
    computed: {
        normalizedIcon() {
            if (!this.icon) {
                return null;
            }

            if (!this.icon.includes(':')) {
                return { name: this.icon };
            }

            const [iconType, variant] = this.icon.split(':');
            return { name: iconType, variant };
        },
    },
    methods: {
        handleClick(event: MouseEvent) {
            this.$emit('click', event);
        },
    },
    render() {
        const { label, normalizedIcon: icon, to, external, handleClick } = this;

        const content = (
            <Fragment>
                <Icon {...{ props: icon } as any} class="DefaultLayoutHeaderDropdownItem__icon" />
                <span class="DefaultLayoutHeaderDropdownItem__content">{label}</span>
            </Fragment>
        );

        if (to) {
            if (external) {
                const isOutside = typeof to === 'string' && to.includes('://');

                return (
                    <a
                        href={to}
                        class="DefaultLayoutHeaderDropdownItem"
                        target={isOutside ? '_blank' : undefined}
                        rel={isOutside ? 'noreferrer noopener' : undefined}
                    >
                        {content}
                    </a>
                );
            }

            return (
                <router-link to={to} custom>
                    {({ href, navigate: handleNavigate }: any) => (
                        <a
                            href={href}
                            onClick={handleNavigate}
                            class="DefaultLayoutHeaderDropdownItem"
                        >
                            {content}
                        </a>
                    )}
                </router-link>
            );
        }

        return (
            <button
                type="button"
                class="DefaultLayoutHeaderDropdownItem"
                onClick={handleClick}
            >
                {content}
            </button>
        );
    },
});

export default DefaultLayoutHeaderDropdownItem;
