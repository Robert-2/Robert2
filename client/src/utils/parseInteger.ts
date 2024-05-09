const parseInteger = (value: unknown): number | null => {
    if (['', null, undefined].includes(value as any)) {
        return null;
    }

    const parsedValue = Number(value);
    return !Number.isNaN(parsedValue) && Number.isInteger(parsedValue)
        ? parsedValue
        : null;
};

export default parseInteger;
