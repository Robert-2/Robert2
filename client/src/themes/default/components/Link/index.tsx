import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import Icon from '@/themes/default/components/Icon';

import type { Location } from 'vue-router';
import type { PropType } from '@vue/composition-api';
import type { Props as IconProps } from '@/themes/default/components/Icon';

type Props = {
    /**
     * La cible du lien sous forme de chaîne ou d'objet `Location` compatible avec Vue-Router.
     *
     * Si non définie, un élément HTML `<button>` sera utilisé et
     * vous devriez écouter l'événement `onClick` pour réagir au click.
     */
    to?: string | Location,

    /**
     * L'icône à utiliser avant le texte du lien.
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
     * Permet d'indiquer que c'est un lien externe.
     *
     * Si c'est le cas, le component fonctionnera comme suit:
     * - Le routing interne ("Vue Router"), ne sera pas utilisé.
     *   (Il ne faut donc pas passer d'objet à `to` mais bien une chaîne)
     * - Si c'est une URL absolue, celle-ci s'ouvrira dans une autre fenêtre / onglet.
     */
    external?: boolean,
};

// @vue/component
const Link = defineComponent({
    props: {
        to: {
            type: [String, Object] as PropType<Props['to']>,
            default: undefined,
        },
        icon: {
            type: String as PropType<Props['icon']>,
            default: undefined,
        },
        external: {
            type: Boolean as PropType<Required<Props>['external']>,
            default: false,
        },
    },
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
        handleClick() {
            this.$emit('click');
        },
    },
    render() {
        const { normalizedIcon: icon, to, external, handleClick } = this;
        const children = this.$slots.default;

        const className = ['Link', {
            'Button--with-icon': !!icon,
        }];

        const content = (
            <Fragment>
                {icon && <Icon {...{ props: icon } as any} class="Link__icon" />}
                {children && <span class="Link__content">{children}</span>}
            </Fragment>
        );

        if (to) {
            if (external) {
                const isOutside = typeof to === 'string' && to.includes('://');

                return (
                    // eslint-disable-next-line react/jsx-no-target-blank
                    <a
                        href={to}
                        class={className}
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
                            class={className}
                        >
                            {content}
                        </a>
                    )}
                </router-link>
            );
        }

        return (
            <button type="button" class={className} onClick={handleClick}>
                {content}
            </button>
        );
    },
});

export default Link;
