import './index.scss';
import Icon from '@/themes/default/components/Icon';

// @vue/component
export default {
    name: 'CalendarCaption',
    render() {
        const { $t: __ } = this;

        return (
            <div class="CalendarCaption">
                <div class="CalendarCaption__group">
                    <h4 class="CalendarCaption__title">{__('page.calendar.caption.title')}</h4>
                    <div class="timeline-event timeline-event--past timeline-event--archived">
                        <Icon name="archive" />
                        {__('page.calendar.caption.archived')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--past">
                        <Icon name="check" />
                        {__('page.calendar.caption.past-and-ok')}
                    </div>
                    <div class="timeline-event timeline-event--past timeline-event--with-warning">
                        <Icon name="exclamation-triangle" />
                        {__('page.calendar.caption.past-material-not-returned')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--past timeline-event--no-return-inventory">
                        <Icon name="clock" />
                        {__('page.calendar.caption.past-no-inventory')}
                    </div>
                    <div class="timeline-event timeline-event--past timeline-event--not-confirmed">
                        <Icon name="question" />
                        {__('page.calendar.caption.past-not-confirmed')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--in-progress">
                        <Icon name="check" />
                        {__('page.calendar.caption.current-confirmed')}
                    </div>
                    <div class="timeline-event timeline-event--in-progress timeline-event--not-confirmed">
                        <Icon name="question" />
                        {__('page.calendar.caption.current-not-confirmed')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event">
                        <Icon name="check" />
                        {__('page.calendar.caption.future-confirmed')}
                    </div>
                    <div class="timeline-event timeline-event--not-confirmed">
                        <Icon name="question" />
                        {__('page.calendar.caption.future-not-confirmed')}
                    </div>
                </div>
            </div>
        );
    },
};
