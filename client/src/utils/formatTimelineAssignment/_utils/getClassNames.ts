import type DateTime from '@/utils/datetime';
import type { TechnicianEvent } from '@/stores/api/technicians';

const getTimelineAssignmentClassNames = (assignment: TechnicianEvent, now: DateTime): string[] => {
    const { is_confirmed: isConfirmed } = assignment.event;
    const isOngoing = now.isBetween(assignment.period);
    const isPast = assignment.period.isBefore(now);

    const classNames = ['timeline-event'];

    if (isPast) {
        classNames.push('timeline-event--past');
    }

    if (isOngoing) {
        classNames.push('timeline-event--in-progress');
    }

    if (!isConfirmed) {
        classNames.push('timeline-event--not-confirmed');
    }

    return classNames;
};

export default getTimelineAssignmentClassNames;
