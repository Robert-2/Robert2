import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
export default defineComponent({
    name: 'Loading',
    props: {
        horizontal: Boolean,
    },
    render() {
        const { $t: __, horizontal } = this;

        return (
            <div class={['Loading', { 'Loading--horizontal': horizontal }]}>
                <svg class="Loading__spinner" viewBox="0 0 50 50">
                    <circle class="Loading__spinner__path" cx="25" cy="25" r="20" fill="none" />
                </svg>
                <span class="Loading__text">{__('loading')}</span>
            </div>
        );
    },
});
