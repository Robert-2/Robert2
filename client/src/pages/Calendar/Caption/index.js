import './index.scss';

export default {
    name: 'CalendarCaption',
    render() {
        const { $t: __ } = this;

        return (
            <div class="CalendarCaption">
                <div class="CalendarCaption__group">
                    <h4 class="CalendarCaption__title">{__('page-calendar.caption.title')}</h4>
                    <div class="timeline-event timeline-event--past timeline-event--archived">
                        <i class="fas fa-archive" />{' '}
                        {__('page-calendar.caption.archived')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--past">
                        <i class="fas fa-check" />{' '}
                        {__('page-calendar.caption.past-and-ok')}
                    </div>
                    <div class="timeline-event timeline-event--past timeline-event--with-warning">
                        <i class="fas fa-exclamation-triangle" />{' '}
                        {__('page-calendar.caption.past-material-not-returned')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--past timeline-event--no-return-inventory">
                        <i class="fas fa-clock" />{' '}
                        {__('page-calendar.caption.past-no-inventory')}
                    </div>
                    <div class="timeline-event timeline-event--past timeline-event--not-confirmed">
                        <i class="fas fa-question" />{' '}
                        {__('page-calendar.caption.past-not-confirmed')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event timeline-event--current">
                        <i class="fas fa-check" />{' '}
                        {__('page-calendar.caption.current-confirmed')}
                    </div>
                    <div class="timeline-event timeline-event--current timeline-event--not-confirmed">
                        <i class="fas fa-question" />{' '}
                        {__('page-calendar.caption.current-not-confirmed')}
                    </div>
                </div>
                <div class="CalendarCaption__group">
                    <div class="timeline-event">
                        <i class="fas fa-check" />{' '}
                        {__('page-calendar.caption.future-confirmed')}
                    </div>
                    <div class="timeline-event timeline-event--not-confirmed">
                        <i class="fas fa-question" />{' '}
                        {__('page-calendar.caption.future-not-confirmed')}
                    </div>
                </div>
            </div>
        );
    },
};
