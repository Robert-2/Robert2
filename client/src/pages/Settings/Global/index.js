import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import Page from '@/components/Page';
import EventSummarySettings from './EventSummary';
import CalendarSettings from './Calendar';

// @vue/component
export default {
    name: 'GlobalSettingsPage',
    render() {
        const { $t: __ } = this;

        return (
            <Page name="global-settings" title={__('page-settings.title')}>
                <Tabs>
                    <template slot="event-summary">
                        <i class="fas fa-print" /> {__('page-settings.event-summary.title')}
                    </template>
                    <template slot="calendar">
                        <i class="fas fa-calendar-alt" /> {__('page-settings.calendar.title')}
                    </template>
                    <Tab title-slot="event-summary">
                        <EventSummarySettings />
                    </Tab>
                    <Tab title-slot="calendar">
                        <CalendarSettings />
                    </Tab>
                </Tabs>
            </Page>
        );
    },
};
