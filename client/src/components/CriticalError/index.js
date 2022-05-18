import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Illustration from './assets/illustration.svg?inline';
import Button from '@/components/Button';

// @vue/component
export default defineComponent({
    name: 'CriticalError',
    props: {
        message: { type: String, default: undefined },
        type: {
            default: 'default',
            validator: (value) => (
                typeof value === 'string' &&
                ['default', 'not-found'].includes(value)
            ),
        },
    },
    computed: {
        displayMessage() {
            const { $t: __, message, type } = this;

            if (message) {
                return message;
            }

            return type === 'not-found'
                ? __('errors.not-found')
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
            if (type === 'not-found') {
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
