export type OptionData = {
    value: string | number,
    label: string,
};

const formatOptions = <T extends Record<string, any>>(
    data: T[] | null | undefined,
    getLabel: ((rawData: T) => string) | null = null,
): OptionData[] => {
    if (data === undefined || data === null) {
        return [];
    }

    return data.map((item: T): OptionData => {
        const value = item.id;
        const label = getLabel ? getLabel(item) : (item.name ?? 'N/A');
        return { value, label };
    });
};

export default formatOptions;
