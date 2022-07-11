import getTimelineEventStatuses from '@/utils/timeline-event/getStatuses';

describe('getTimelineEventStatuses', () => {
    test('When event is future, and not confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([{ icon: 'question', label: '@event.statuses.is-not-confirmed' }]);
    });

    test('When event is current, and not confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'question', label: '@event.statuses.is-not-confirmed' },
            { icon: 'running', label: '@event.statuses.is-currently-running' },
        ]);
    });

    test('When event is past, and not confirmed', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'history', label: '@event.statuses.is-past' },
            { icon: 'exclamation-triangle', label: '@event.statuses.needs-its-return-inventory' },
        ]);
    });

    test('When event is future, and confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([{ icon: 'check', label: '@event.statuses.is-confirmed' }]);
    });

    test('When event is current, and confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'running', label: '@event.statuses.is-currently-running' },
            { icon: 'check', label: '@event.statuses.is-confirmed' },
        ]);
    });

    test('When event is past and confirmed, but not archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'lock', label: '@event.statuses.is-locked' },
            { icon: 'exclamation-triangle', label: '@event.statuses.needs-its-return-inventory' },
        ]);
    });

    test('When event is past, confirmed and archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: true,
            isInventoryDone: true,
            hasMissingMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([{ icon: 'archive', label: '@event.statuses.is-archived' }]);
    });

    test('When event is future, not confirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: true,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'question', label: '@event.statuses.is-not-confirmed' },
            { icon: 'exclamation-triangle', label: '@event.statuses.has-missing-materials' },
        ]);
    });

    test('When event is current, not confirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: true,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'question', label: '@event.statuses.is-not-confirmed' },
            { icon: 'running', label: '@event.statuses.is-currently-running' },
            { icon: 'exclamation-triangle', label: '@event.statuses.has-missing-materials' },
        ]);
    });

    test('When event is past, not confirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'history', label: '@event.statuses.is-past' },
            { icon: 'exclamation-triangle', label: '@event.statuses.needs-its-return-inventory' },
        ]);
    });

    test('When event is future, confirmed, and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: true,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'check', label: '@event.statuses.is-confirmed' },
            { icon: 'exclamation-triangle', label: '@event.statuses.has-missing-materials' },
        ]);
    });

    test('When event is current, confirmed, and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: true,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'running', label: '@event.statuses.is-currently-running' },
            { icon: 'check', label: '@event.statuses.is-confirmed' },
            { icon: 'exclamation-triangle', label: '@event.statuses.has-missing-materials' },
        ]);
    });

    test('When event is past and confirmed, but not archived and has missing materials', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'lock', label: '@event.statuses.is-locked' },
            { icon: 'exclamation-triangle', label: '@event.statuses.needs-its-return-inventory' },
        ]);
    });

    test('When event is past, confirmed, and has a return inventory OK', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: true,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([{ icon: 'lock', label: '@event.statuses.is-locked' }]);
    });

    test('When event is past, confirmed, inventory done, has materials not returned and not archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: true,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: true,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'exclamation-triangle', label: '@event.statuses.has-not-returned-materials' },
            { icon: 'lock', label: '@event.statuses.is-locked' },
        ]);
    });

    test('When event is past, confirmed, inventory done, has materials not returned and is archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: true,
            isInventoryDone: true,
            hasMissingMaterials: null,
            hasNotReturnedMaterials: true,
        };
        const result = getTimelineEventStatuses(formattedEvent, (v) => v);
        expect(result).toEqual([
            { icon: 'exclamation-triangle', label: '@event.statuses.has-not-returned-materials' },
            { icon: 'archive', label: '@event.statuses.is-archived' },
        ]);
    });
});
