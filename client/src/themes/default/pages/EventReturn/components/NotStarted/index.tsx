import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Button from '@/themes/default/components/Button';
import Icon from '@/themes/default/components/Icon';

// @vue/component
const EventReturnNotStarted = defineComponent({
    name: 'EventReturnNotStarted',
    render() {
        const { $t: __ } = this;

        return (
            <div class="EventReturnNotStarted">
                <p class="EventReturnNotStarted__content">
                    <span class="EventReturnNotStarted__message">
                        <Icon name="exclamation-triangle" />{' '}
                        {__('page.event-return.not-started-yet-alert')}
                    </span>
                    <Button to={{ name: 'calendar' }} icon="arrow-left" type="primary">
                        {__('back-to-calendar')}
                    </Button>
                </p>
            </div>
        );
    },
});

export default EventReturnNotStarted;
