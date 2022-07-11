const getTimelineEventStatuses = (formattedEvent, __) => {
    const {
        isPast,
        isCurrent,
        isConfirmed,
        isInventoryDone,
        isArchived,
        hasMissingMaterials,
        hasNotReturnedMaterials,
    } = formattedEvent;

    const eventStatuses = [];

    if (isPast && hasNotReturnedMaterials) {
        eventStatuses.push({
            icon: 'exclamation-triangle',
            label: __('@event.statuses.has-not-returned-materials'),
        });
    }

    if (isArchived) {
        eventStatuses.push({
            icon: 'archive',
            label: __('@event.statuses.is-archived'),
        });
        return eventStatuses;
    }

    if (isPast && !isConfirmed) {
        eventStatuses.push({
            icon: 'history',
            label: __('@event.statuses.is-past'),
        });
    }

    if (!isPast && !isConfirmed) {
        eventStatuses.push({
            icon: 'question',
            label: __('@event.statuses.is-not-confirmed'),
        });
    }

    if (isCurrent) {
        eventStatuses.push({
            icon: 'running',
            label: __('@event.statuses.is-currently-running'),
        });
    }

    if (isConfirmed) {
        eventStatuses.push({
            icon: isPast ? 'lock' : 'check',
            label: isPast
                ? __('@event.statuses.is-locked')
                : __('@event.statuses.is-confirmed'),
        });
    }

    if (hasMissingMaterials) {
        eventStatuses.push({
            icon: 'exclamation-triangle',
            label: __('@event.statuses.has-missing-materials'),
        });
    }

    if (isPast && !isInventoryDone) {
        eventStatuses.push({
            icon: 'exclamation-triangle',
            label: __('@event.statuses.needs-its-return-inventory'),
        });
    }

    return eventStatuses;
};

export default getTimelineEventStatuses;
