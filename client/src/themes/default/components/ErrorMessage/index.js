import './index.scss';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import { getErrorMessage } from '@/utils/errors';
import showModal from '@/utils/showModal';
import Modal from './modals/Details';

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
        statusCode() {
            const { error } = this;
            if (!error.response) {
                return -1;
            }
            return error.response?.status ?? HttpCode.ServerErrorInternal;
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

            const { statusCode, message, details } = this;
            showModal(this.$modal, Modal, {
                ...{ statusCode, message, details },
                onClosed: () => {
                    this.isDetailsModalOpened = false;
                },
            });
        },
    },
    render() {
        const { $t: __, statusCode, message, handleShowDetails } = this;

        return (
            <p class="ErrorMessage">
                <span class="ErrorMessage__message">
                    <i class="fas fa-exclamation-triangle" />&nbsp;{message}
                </span>
                {statusCode === HttpCode.ServerErrorInternal && (
                    <a class="ErrorMessage__show-details" onClick={handleShowDetails}>
                        <i class="fas fa-external-link-alt" />&nbsp;{__('errors.show-details')}
                    </a>
                )}
            </p>
        );
    },
});
