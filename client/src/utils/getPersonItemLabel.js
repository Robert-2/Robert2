const getPersonItemLabel = (itemData) => {
    const {
        label: alreadySetLabel,
        first_name: firstName,
        last_name: lastName,
        reference,
        company,
        locality,
    } = itemData;

    if (alreadySetLabel) {
        return alreadySetLabel;
    }

    let label = `${lastName} ${firstName}`;
    if (reference && reference.length > 0) {
        label += ` (${reference})`;
    }
    if (company && company.legal_name.length > 0) {
        label += ` − ${company.legal_name}`;
    }
    if (locality && locality.length > 0) {
        label += ` − ${locality}`;
    }
    return label;
};

export default getPersonItemLabel;
