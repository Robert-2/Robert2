import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import Page from '@/themes/default/components/Page';
import EventSummarySettings from './tabs/EventSummary';
import CalendarSettings from './tabs/Calendar';
import ReturnInventorySettings from './tabs/ReturnInventory';

// @vue/component
const GlobalSettingsPage = defineComponent({
    name: 'GlobalSettingsPage',
    render() {
        const { $t: __ } = this;

        return (
            <Page name="global-settings" title={__('page.settings.title')}>
                <Tabs>
                    <Tab title={__('page.settings.calendar.title')} icon="calendar-alt">
                        <CalendarSettings />
                    </Tab>
                    <Tab title={__('page.settings.event-summary.title')} icon="print">
                        <EventSummarySettings />
                    </Tab>
                    <Tab title={__('page.settings.return-inventory.title')} icon="tasks">
                        <ReturnInventorySettings />
                    </Tab>
                </Tabs>
            </Page>
        );
    },
});

export default GlobalSettingsPage;
