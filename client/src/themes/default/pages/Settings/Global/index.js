import './index.scss';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import Page from '@/themes/default/components/Page';
import EventSummarySettings from './tabs/EventSummary';
import CalendarSettings from './tabs/Calendar';

// @vue/component
export default {
    name: 'GlobalSettingsPage',
    render() {
        const { $t: __ } = this;

        return (
            <Page name="global-settings" title={__('page.settings.title')}>
                <Tabs>
                    <Tab title={__('page.settings.event-summary.title')} icon="print">
                        <EventSummarySettings />
                    </Tab>
                    <Tab title={__('page.settings.calendar.title')} icon="calendar-alt">
                        <CalendarSettings />
                    </Tab>
                </Tabs>
            </Page>
        );
    },
};
