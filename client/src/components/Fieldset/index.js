import './index.scss';

// @vue/component
export default {
    name: 'Fieldset',
    inject: {
        verticalForm: { default: false },
    },
    props: {
        title: { type: String, default: undefined },
        required: { type: Boolean, default: false },
    },
    render() {
        const { title, required, verticalForm } = this;
        const children = this.$slots.default;

        const classNames = ['Fieldset', {
            'Fieldset--required': required,
            'Fieldset--in-vertical-form': verticalForm,
        }];

        return (
            <section class={classNames}>
                {title && <h3 class="Fieldset__title">{title}</h3>}
                <div className="Fieldset__body">
                    {children}
                </div>
            </section>
        );
    },
};
