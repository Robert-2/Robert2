import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import Icon from '@/components/Icon';

import type { Component, SetupContext } from '@vue/composition-api';
import type { Props as IconProps } from '@/components/Icon';

type Props = {
    /**
     * Le type de bouton pour l'attribut `type` de la balise `<button>`?
     *
     * Options disponibles: `submit`, `button` ou `reset`.
     */
    htmlType?: 'submit' | 'button' | 'reset',

    /**
     * Le code de l'éventuelle icône qui sera ajoutée au bouton.
     *
     * Pour utiliser une variante de l'icône, vous pouvez suffixer le nom de l'icône avec `:[variante]`.
     * Par exemple: `plus:solid` ou `birthday-cake:regular`.
     *
     * Voir le component <Icon> concernant la liste des codes et les variantes possibles.
     */
    icon?: string | undefined,

    /** Le bouton est-il désactivé ? */
    disabled?: boolean,

    /** Des éventuelles classes supplémentaires qui seront ajoutées au component. */
    class?: string,
};

// @vue/component
const Button: Component<Props> = (props: Props, { slots }: SetupContext) => {
    const { htmlType, icon, disabled } = toRefs(props as Required<Props>);
    const _icon = computed<IconProps | null>(() => {
        if (!icon.value) {
            return null;
        }

        if (!icon.value.includes(':')) {
            return { name: icon.value };
        }

        const [iconType, variant] = icon.value.split(':');
        return { name: iconType, variant: variant as any };
    });

    const _className = ['Button', {
        'Button--with-icon': !!_icon,
    }];

    return () => {
        const children = slots.default?.();

        return (
            // eslint-disable-next-line react/button-has-type
            <button type={htmlType.value} class={_className} disabled={disabled.value}>
                {_icon.value && <Icon {...{ props: _icon.value } as any} class="Button__icon" />}
                {children && <span class="Button__content">{children}</span>}
            </button>
        );
    };
};

Button.props = {
    htmlType: {
        default: 'button',
        validator: (value: unknown) => (
            typeof value === 'string' &&
            ['button', 'submit', 'reset'].includes(value)
        ),
    },
    icon: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
};

export default Button;
