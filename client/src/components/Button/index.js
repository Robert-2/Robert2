import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { Fragment } from 'vue-fragment';
import Icon from '@/components/Icon';
import useI18n from '@/hooks/vue/useI18n';

const TYPES = ['default', 'success', 'warning', 'danger', 'primary'];

// NOTE: L'idée ici n'est pas d'ajouter tous les types possibles mais uniquement ceux
// qui se retrouvent à de multiples endroits (pour éviter d'avoir des soucis de cohérence)
const PREDEFINED_TYPES = {
    add: {
        type: 'success',
        icon: 'plus',
    },
    edit: (__) => ({
        type: 'success',
        icon: 'edit',
        tooltip: __('action-edit'),
    }),
    trash: (__) => ({
        type: 'danger',
        icon: 'trash',
        tooltip: __('action-trash'),
    }),
    delete: (__) => ({
        type: 'danger',
        icon: 'trash-alt',
        tooltip: __('action-delete'),
    }),
    restore: (__) => ({
        type: 'success',
        icon: 'trash-restore',
        tooltip: __('action-restore'),
    }),
};

// @vue/component
const Button = (props, { slots, emit }) => {
    const __ = useI18n();
    const {
        htmlType,
        icon,
        disabled,
        type,
        to,
        loading,
        tooltip,
    } = toRefs(props);

    const getPredefinedValue = (key) => {
        if (!Object.keys(PREDEFINED_TYPES).includes(type.value)) {
            return undefined;
        }

        const value = typeof PREDEFINED_TYPES[type.value] === 'function'
            ? PREDEFINED_TYPES[type.value](__)
            : PREDEFINED_TYPES[type.value];

        return value[key] ?? null;
    };

    const _type = computed(() => {
        const predefinedValue = getPredefinedValue('type');
        return predefinedValue !== undefined
            ? (predefinedValue ?? 'default')
            : type.value;
    });

    const _icon = computed(() => {
        const __icon = icon.value ?? getPredefinedValue('icon');
        if (!__icon) {
            return null;
        }

        if (loading.value) {
            return { name: 'spinner', spin: true };
        }

        if (!__icon.includes(':')) {
            return { name: __icon };
        }

        const [iconType, variant] = __icon.split(':');
        return { name: iconType, variant };
    });

    const _tooltip = computed(() => {
        const predefinedValue = getPredefinedValue('tooltip');
        if (predefinedValue == null || typeof tooltip.value === 'string') {
            return tooltip.value;
        }

        if (tooltip.value == null) {
            return predefinedValue;
        }

        return {
            ...tooltip.value,
            'content': tooltip.value.content ?? predefinedValue,
        };
    });

    const _className = computed(() => [
        'Button',
        `Button--${_type.value}`, {
            'Button--disabled': disabled.value || loading.value,
            'Button--loading': loading.value,
            'Button--with-icon': !!_icon.value,
        },
    ]);

    return () => {
        const children = slots.default?.();

        const content = (
            <Fragment>
                {_icon.value && <Icon {...{ props: _icon.value }} class="Button__icon" />}
                {children && <span class="Button__content">{children}</span>}
            </Fragment>
        );

        if (to.value && !disabled.value) {
            return (
                <router-link to={to.value} custom>
                    {({ href, navigate: handleClick }) => (
                        <a
                            href={href}
                            onClick={handleClick}
                            v-tooltip={_tooltip.value}
                            class={_className.value}
                        >
                            {content}
                        </a>
                    )}
                </router-link>
            );
        }

        return (
            <button
                // eslint-disable-next-line react/button-has-type
                type={htmlType.value}
                class={_className.value}
                disabled={disabled.value || loading.value}
                v-tooltip={!disabled.value ? _tooltip.value : undefined}
                onClick={emit.bind(null, 'click')}
            >
                {content}
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
        validator: (value) => (
            [TYPES, Object.keys(PREDEFINED_TYPES)]
                .flat()
                .includes(value)
        ),
        default: 'default',
    },
    to: {
        type: [String, Object],
        default: undefined,
    },
    tooltip: {
        type: [String, Object],
        default: undefined,
    },
    icon: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
};

Button.emits = ['click'];

export default Button;
