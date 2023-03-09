import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';

// @vue/component
const Tab = defineComponent({
    name: 'Tab',
    props: {
        // - Ces props sont utilisées dans le composant parent 'Tabs'.
        title: { type: String, required: true },
        icon: { type: String, default: null },
        disabled: { type: Boolean, default: false },
        warning: { type: Boolean, default: false },
        counter: { type: Number, default: null },
    },
    render() {
        const { default: children } = this.$slots;

        return (
            <Fragment>
                {children}
            </Fragment>
        );
    },
});

export default Tab;
