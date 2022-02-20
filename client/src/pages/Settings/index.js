import './index.scss';
import { Tabs, Tab } from 'vue-slim-tabs';
import EventSummarySettings from './EventSummary';
import CalendarSettings from './Calendar';

// @vue/component
export default {
    name: 'Settings',
    render() {
        const { $t: __ } = this;

        return (
            <div class="content">
                <div class="content__main-view">
                    <div class="SettingsPage">
                        <Tabs class="SettingsPage__body">
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
                    </div>
                </div>
            </div>
        );
    },
};
