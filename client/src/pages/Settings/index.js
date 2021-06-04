import { Tabs, Tab } from 'vue-slim-tabs';
import EventSummarySettings from './EventSummary';

export default {
  name: 'Settings',
  render() {
    const { $t: __ } = this;

    return (
      <div class="content">
        <div class="content__main-view">
          <div class="Settings">
            <Tabs class="Settings__body">
              <template slot="event-summary">
                <i class="fas fa-print" /> {__('page-settings.event-summary.title')}
              </template>
              <Tab title-slot="event-summary">
                <EventSummarySettings />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  },
};
