const formatOptions = (data, getLabel = null) => {
    if (data === undefined || data === null) {
        return [];
    }

    const options = data.map((item) => {
        const value = item.id;
        const label = getLabel ? getLabel(item) : (item.name || 'N/A');
        return { value, label };
    });

    return options;
};

export default formatOptions;
