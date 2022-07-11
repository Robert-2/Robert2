import type { Country } from '@/stores/api/countries';

const formatAddress = (
    street: string | null,
    postalCode: string | null,
    locality: string | null,
    country?: Country | null,
): string | null => {
    if (!street && !postalCode && !locality && !country) {
        return null;
    }

    let line2: string | null = null;
    if (postalCode && !locality) {
        line2 = postalCode;
    } else if (!postalCode && locality) {
        line2 = locality;
    } else if (postalCode && locality) {
        line2 = `${postalCode} ${locality}`;
    }

    let line3: string | null = null;
    if (country) {
        line3 = country.name;
    }

    return [street, line2, line3]
        .filter((value: string | null) => value !== null)
        .join('\n');
};

export default formatAddress;
