import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import Icon from '@/components/Icon';

const BUTTON_TYPE = ['default', 'success', 'warning', 'danger'];

// type Props = {
//     /**
//      * Le type de bouton pour l'attribut `type` de la balise `<button>`?
//      *
//      * Options disponibles: `submit`, `button` ou `reset`.
//      */
//     htmlType?: 'submit' | 'button' | 'reset',

//     /**
//      * Le code de l'éventuelle icône qui sera ajoutée au bouton.
//      *
//      * Pour utiliser une variante de l'icône, vous pouvez suffixer le nom de l'icône avec `:[variante]`.
//      * Par exemple: `plus:solid` ou `birthday-cake:regular`.
//      *
//      * Voir le component <Icon> concernant la liste des codes et les variantes possibles.
//      */
//     icon?: string | undefined,

//     /** Le bouton est-il désactivé ? */
//     disabled?: boolean,

//     /** Des éventuelles classes supplémentaires qui seront ajoutées au component. */
//     class?: string,
// };

// @vue/component
const Button = (props, { slots, emit }) => {
    const { htmlType, icon, disabled, type } = toRefs(props);
    const _icon = computed(() => {
        if (!icon.value) {
            return null;
        }

        if (!icon.value.includes(':')) {
            return { name: icon.value };
        }

        const [iconType, variant] = icon.value.split(':');
        return { name: iconType, variant };
    });

    const _className = ['Button', `Button--${type.value}`, {
        'Button--disabled': disabled.value,
        'Button--with-icon': !!_icon,
    }];

    return () => {
        const children = slots.default?.();

        return (
            <button
                // eslint-disable-next-line react/button-has-type
                type={htmlType.value}
                class={_className}
                disabled={disabled.value}
                onClick={emit.bind(null, 'click')}
            >
                {_icon.value && <Icon {...{ props: _icon.value }} class="Button__icon" />}
                {children && <span class="Button__content">{children}</span>}
            </button>
        );
    };
};

Button.props = {
    htmlType: {
        default: 'button',
        validator: (value) => (
            typeof value === 'string' &&
            ['button', 'submit', 'reset'].includes(value)
        ),
    },
    type: {
        type: String,
        validator: (value) => BUTTON_TYPE.includes(value),
        default: 'default',
    },
    icon: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
};

Button.emits = ['click'];

export default Button;
