import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon/index';

// @vue/component
const TabButton = defineComponent({
    name: 'TabButton',
    props: {
        title: { type: String, required: true },
        icon: { type: String, default: null },
        disabled: { type: Boolean, default: false },
        warning: { type: Boolean, default: false },
        counter: { type: Number, default: null },
        active: { type: Boolean, default: false },
    },
    computed: {
        _icon() {
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
            if (this.disabled) {
                return;
            }
            this.$emit('click');
        },
    },
    render() {
        const { title, _icon, disabled, warning, counter, active, handleClick } = this;
        const hasCounter = counter !== null && counter > 0;

        const className = ['TabButton', {
            'TabButton--selected': active,
            'TabButton--disabled': disabled,
            'TabButton--warning': warning,
            'TabButton--with-counter': hasCounter,
        }];

        return (
            <li role="tab" class={className} onClick={handleClick}>
                {_icon && <Icon {...{ props: _icon }} class="TabButton__icon" />}
                {title}
                {hasCounter && (
                    <span class="TabButton__counter">
                        {counter}
                    </span>
                )}
            </li>
        );
    },
});

export default TabButton;
