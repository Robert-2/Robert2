import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
const Fragment = defineComponent({
    name: 'Fragment',
    render() {
        const children = this.$slots.default;

        return (
            <div class="Fragment">
                {children}
            </div>
        );
    },
});

export default Fragment;
