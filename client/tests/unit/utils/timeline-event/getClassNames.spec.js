import getTimelineEventClassNames from '@/utils/timeline-event/getClassNames';

describe('getTimelineEventClassNames', () => {
    test('When event is future, and not confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual(['timeline-event', 'timeline-event--not-confirmed']);
    });

    test('When event is current, and not confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--current',
            'timeline-event--not-confirmed',
        ]);
    });

    test('When event is past, and not confirmed', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: null,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--not-confirmed',
        ]);
    });

    test('When event is future, and confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual(['timeline-event']);
    });

    test('When event is current, and confirmed', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual(['timeline-event', 'timeline-event--current']);
    });

    test('When event is past and confirmed, but not archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: null,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--no-return-inventory',
        ]);
    });

    test('When event is past, confirmed and archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: true,
            isInventoryDone: false,
            hasMissingMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--no-return-inventory',
            'timeline-event--archived',
        ]);
    });

    test('When event is past, its inventory done and is archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: true,
            isInventoryDone: true,
            hasMissingMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--archived',
        ]);
    });

    test('When event is future, unconfirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: true,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--not-confirmed',
            'timeline-event--with-warning',
        ]);
    });

    test('When event is current, unconfirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: true,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--current',
            'timeline-event--not-confirmed',
            'timeline-event--with-warning',
        ]);
    });

    test('When event is past, unconfirmed and has missing materials', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            hasMissingMaterials: null,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--not-confirmed',
        ]);
    });

    test('When event is future, confirmed, and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: true,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual(['timeline-event', 'timeline-event--with-warning']);
    });

    test('When event is current, confirmed, and has missing materials', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: true,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: true,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--current',
            'timeline-event--with-warning',
        ]);
    });

    test('When event is past and confirmed, and not archived', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: null,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--no-return-inventory',
        ]);
    });

    test('When event is past, confirmed, inventory done, and has materials not returned', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            hasMissingMaterials: null,
            isInventoryDone: true,
            hasNotReturnedMaterials: true,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--with-warning',
        ]);
    });

    test('When event is past, confirmed and archived, and has materials not returned', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: true,
            hasMissingMaterials: true,
            isInventoryDone: true,
            hasNotReturnedMaterials: true,
        };
        const result = getTimelineEventClassNames(formattedEvent);
        expect(result).toEqual([
            'timeline-event',
            'timeline-event--past',
            'timeline-event--archived',
            'timeline-event--with-warning',
        ]);
    });
});
