import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { getErrorMessage } from '@/utils/errors';
import Details from './modals/Details';

// @vue/component
export default defineComponent({
    name: 'ErrorMessage',
    props: {
        error: { type: [String, Error], required: true },
    },
    data() {
        return {
            isDetailsModalOpened: false,
        };
    },
    computed: {
        code() {
            const { error } = this;
            if (!error.response) {
                return -1;
            }
            return error.response?.status ?? 500;
        },

        message() {
            return getErrorMessage(this.error, this.$t);
        },

        details() {
            const { error } = this;
            if (!error.response) {
                return null;
            }
            const { data } = error.response;
            return data?.error?.debug ?? null;
        },
    },
    methods: {
        handleShowDetails() {
            if (this.isDetailsModalOpened) {
                return;
            }
            this.isDetailsModalOpened = true;
            const { code, message, details } = this;

            this.$modal.show(Details, { code, message, details }, undefined, {
                'before-close': () => {
                    this.isDetailsModalOpened = false;
                },
            });
        },
    },
    render() {
        const { $t: __, code, message, handleShowDetails } = this;

        return (
            <p class="ErrorMessage">
                <span class="ErrorMessage__message">
                    <i class="fas fa-exclamation-triangle" />&nbsp;{message}
                </span>
                {code === 500 && (
                    <a class="ErrorMessage__show-details" onClick={handleShowDetails}>
                        <i class="fas fa-external-link-alt" />&nbsp;{__('errors.show-details')}
                    </a>
                )}
            </p>
        );
    },
});
