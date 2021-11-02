const getFormDataAsJson = (formElement: EventTarget | HTMLFormElement | null): Record<string, any> => {
    if (!(formElement instanceof HTMLFormElement)) {
        return {};
    }

    const formData = new FormData(formElement);
    return Object.fromEntries(formData.entries());
};

export default getFormDataAsJson;
