import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
const Fieldset = defineComponent({
    name: 'Fieldset',
    inject: {
        verticalForm: { default: false },
    },
    props: {
        title: { type: String, default: undefined },
        help: { type: String, default: undefined },
    },
    render() {
        const { title, help, verticalForm } = this;
        const children = this.$slots.default;

        const classNames = ['Fieldset', {
            'Fieldset--in-vertical-form': verticalForm,
        }];

        return (
            <section class={classNames}>
                {title && <h3 class="Fieldset__title">{title}</h3>}
                {help && <p class="Fieldset__help">{help}</p>}
                <div class="Fieldset__body">
                    {children}
                </div>
            </section>
        );
    },
});

export default Fieldset;
