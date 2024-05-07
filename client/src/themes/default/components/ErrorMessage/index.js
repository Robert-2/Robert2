import './index.scss';
import axios from 'axios';
import HttpCode from 'status-code-enum';
import { defineComponent } from '@vue/composition-api';
import Icon from '@/themes/default/components/Icon';

/** @deprecated */
export default defineComponent({
    name: 'ErrorMessage',
    props: {
        error: { type: [String, Error], required: true },
    },
    computed: {
        message() {
            const { $t: __, error } = this;

            if (typeof error === 'string') {
                return error;
            }

            if (axios.isAxiosError(error)) {
                const { status } = error.response || {
                    status: HttpCode.ServerErrorInternal,
                    data: undefined,
                };

                if (status === HttpCode.ClientErrorBadRequest) {
                    return __('errors.validation');
                }

                if (status === HttpCode.ClientErrorNotFound) {
                    return __('errors.record-not-found');
                }

                if (status === HttpCode.ClientErrorConflict) {
                    return __('errors.already-exists');
                }
            }

            // eslint-disable-next-line no-console
            console.error(error);

            return __('errors.unknown');
        },
    },
    render() {
        const { message } = this;

        return (
            <p class="ErrorMessage">
                <Icon name="exclamation-triangle" class="ErrorMessage__icon" />
                {message}
            </p>
        );
    },
});
