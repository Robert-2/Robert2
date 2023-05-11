import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';
import IconMessage from '@/themes/default/components/IconMessage';

// @vue/component
const EventReturnNotStarted = defineComponent({
    name: 'EventReturnNotStarted',
    render() {
        const { $t: __ } = this;

        return (
            <div class="EventReturnNotStarted">
                <div class="EventReturnNotStarted__content">
                    <IconMessage
                        name="exclamation-triangle"
                        message={__('page.event-return.not-started-yet-alert')}
                        class="EventReturnNotStarted__message"
                    />
                    <Button to={{ name: 'calendar' }} icon="arrow-left" type="primary">
                        {__('back-to-calendar')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default EventReturnNotStarted;
