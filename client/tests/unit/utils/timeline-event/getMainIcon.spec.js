import getMainIcon from '@/utils/timeline-event/getMainIcon';

describe('getMainIcon', () => {
    test('When event is not confirmed, and not past', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('question');
    });

    test('When event is confirmed, and not past', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('check');
    });

    test('When event is not confirmed, and is past', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: false,
            isArchived: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('question');
    });

    test('When event is confirmed, and is past', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('clock');
    });

    test('When event is past, its return inventory done, and all material is back', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: true,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('check');
    });

    test('When event is past, its return inventory done, and some material did not came back', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: true,
            hasNotReturnedMaterials: true,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toBe(null);
    });

    test('When event is past, and its return inventory not done yet', () => {
        const formattedEvent = {
            isPast: true,
            isCurrent: false,
            isConfirmed: true,
            isArchived: false,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toBe('clock');
    });

    test('When event is archived', () => {
        const formattedEvent = {
            isPast: false,
            isCurrent: false,
            isConfirmed: false,
            isArchived: true,
            isInventoryDone: false,
            hasNotReturnedMaterials: false,
        };
        const result = getMainIcon(formattedEvent);
        expect(result).toEqual('archive');
    });
});
