import './index.scss';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

// @vue/component
export default {
    name: 'EventReturnNotStarted',
    render() {
        const { $t: __ } = this;

        return (
            <div class="EventReturnNotStarted">
                <p class="EventReturnNotStarted__warning">
                    <Icon name="exclamation-triangle" />
                    {__('page.event-return.this-event-not-started-yet')}
                </p>
                <router-link to="/" custom>
                    {({ navigate }) => (
                        <Button onClick={navigate} icon="arrow-left" type="primary">
                            {__('back-to-calendar')}
                        </Button>
                    )}
                </router-link>
            </div>
        );
    },
};
