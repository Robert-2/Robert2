import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
export default defineComponent({
    name: 'Loading',
    props: {
        horizontal: Boolean,
    },
    data() {
        return {
            shown: this.horizontal,
        };
    },
    created() {
        if (!this.horizontal) {
            this.shownTimer = setTimeout(
                () => { this.shown = true; },
                500,
            );
        }
    },
    beforeUnmount() {
        if (this.shownTimer) {
            clearTimeout(this.shownTimer);
        }
    },
    render() {
        const { $t: __, horizontal, shown } = this;

        if (!shown) {
            return null;
        }

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
