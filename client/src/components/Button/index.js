import './index.scss';
import { toRefs, computed } from '@vue/composition-api';
import { Fragment } from 'vue-fragment';
import Icon from '@/components/Icon';

const BUTTON_TYPE = ['default', 'success', 'warning', 'danger', 'primary'];

// @vue/component
const Button = (props, { slots, emit }) => {
    const { htmlType, icon, disabled, type, to, loading } = toRefs(props);
    const _icon = computed(() => {
        if (!icon.value) {
            return null;
        }

        if (loading.value) {
            return { name: 'spinner', spin: true };
        }

        if (!icon.value.includes(':')) {
            return { name: icon.value };
        }

        const [iconType, variant] = icon.value.split(':');
        return { name: iconType, variant };
    });

    const _className = computed(() => [
        'Button',
        `Button--${type.value}`, {
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
                        <a href={href} onClick={handleClick} class={_className.value}>
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
        validator: (value) => BUTTON_TYPE.includes(value),
        default: 'default',
    },
    to: {
        type: [String, Object],
        default: undefined,
    },
    icon: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
};

Button.emits = ['click'];

export default Button;
