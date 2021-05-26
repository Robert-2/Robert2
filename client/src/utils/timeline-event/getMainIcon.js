const getMainIcon = (statuses) => {
  const {
    isConfirmed,
    isPast,
    isInventoryDone,
    hasNotReturnedMaterials,
  } = statuses;

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
