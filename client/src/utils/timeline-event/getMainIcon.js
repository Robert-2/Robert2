const getMainIcon = (statuses) => {
    const { isConfirmed, isArchived, isPast, isInventoryDone, hasNotReturnedMaterials } = statuses;

    if (isArchived) {
        return 'archive';
    }

    if (!isConfirmed) {
        return 'question';
    }

    if (!isPast) {
        return 'check';
    }

    if (isPast && isInventoryDone && !hasNotReturnedMaterials) {
        return 'check';
    }

    if (isPast && !isInventoryDone) {
        return 'clock';
    }

    return null;
};

export default getMainIcon;
