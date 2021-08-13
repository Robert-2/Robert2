import './index.scss';
import Timeline from '@/components/Timeline';
import formatEventTechnician from '@/utils/formatEventTechnician';
import formatEventTechniciansList from '@/utils/formatEventTechniciansList';

export default {
    name: 'EventDetailsTechnicians',
    props: {
        event: { type: Object, required: true },
    },
    computed: {
        techniciansList() {
            return formatEventTechniciansList(this.event.technicians);
        },

        groups() {
            return this.techniciansList.map(({ id, name }) => ({ id, content: name }));
        },

        events() {
            const { event } = this;

            return (event.technicians ?? []).map((eventTechnician) => {
                const { id, start, end, content, title } = formatEventTechnician(
                    { ...eventTechnician, event },
                    { withEventTitle: false },
                );

                return {
                    id,
                    start,
                    end,
                    content,
                    group: eventTechnician.technician_id,
                    editable: false,
                    type: 'range',
                    title,
                };
            });
        },

        timelineOptions() {
            const { start_date: startDate, end_date: endDate } = this.event;

            return {
                min: startDate,
                max: endDate,
                showCurrentTime: false,
                margin: { axis: 0 },
                type: 'background',
                zoomMin: 1000 * 3600, // 1h
                selectable: false,
                orientation: 'top',
            };
        },
    },
    render() {
        const { events, groups, timelineOptions } = this;

        return (
            <div class="EventDetailsTechnicians">
                <div class="EventDetailsTechnicians__loading">
                    <i class="fas fa-circle-notch fa-3x fa-spin" />
                </div>
                <Timeline
                    class="EventDetailsTechnicians__timeline"
                    items={events}
                    groups={groups}
                    options={timelineOptions}
                />
            </div>
        );
    },
};
