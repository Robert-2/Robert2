const getCSSProperty = (property: string, element?: Element): string | null => {
    const value = getComputedStyle(element ?? document.body).getPropertyValue(`--${property}`);
    return value.length > 0 ? value : null;
};

export default getCSSProperty;
