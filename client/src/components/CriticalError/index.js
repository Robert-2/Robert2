import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Illustration from './assets/illustration.svg?inline';
import Button from '@/components/Button';

// TODO: Enum typescript lorsque ce sera typé.
export const ERROR = {
    NOT_FOUND: 'not-found',
    UNKNOWN: 'unknown',
};

// @vue/component
export default defineComponent({
    name: 'CriticalError',
    props: {
        message: { type: String, default: undefined },
        type: {
            default: ERROR.UNKNOWN,
            validator: (value) => (
                Object.values(ERROR).includes(value)
            ),
        },
    },
    computed: {
        displayMessage() {
            const { $t: __, message, type } = this;

            if (message) {
                return message;
            }

            return type === ERROR.NOT_FOUND
                ? __('errors.page-not-found')
                : __('errors.critical');
        },
    },
    methods: {
        handleRefresh() {
            window.location.reload();
        },
    },
    render() {
        const { $t: __, displayMessage, type, handleRefresh } = this;

        const renderButton = () => {
            if (type === ERROR.NOT_FOUND) {
                return (
                    <Button to={{ name: 'events' }} type="primary" class="CriticalError__back-to-calendar">
                        {__('back-to-calendar')}
                    </Button>
                );
            }
            return (
                <Button onClick={handleRefresh} type="primary" class="CriticalError__refresh">
                    {__('refresh-page')}
                </Button>
            );
        };

        return (
            <div class="CriticalError">
                <Illustration class="CriticalError__illustration" />
                <p class="CriticalError__message">{displayMessage}</p>
                {renderButton()}
            </div>
        );
    },
});
