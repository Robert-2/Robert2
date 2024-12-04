import type { Tax } from '../_types';

const sortTaxes = <T extends Tax>(taxes: T[]): T[] => {
    const sorter = (a: T, b: T): number => {
        if ((a.is_rate && !b.is_rate) || (!a.is_rate && b.is_rate)) {
            return a.is_rate ? -1 : 1;
        }

        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison !== 0 || !a.is_rate || !b.is_rate) {
            return nameComparison;
        }

        return a.value.comparedTo(b.value);
    };
    return [...taxes].sort(sorter);
};

export default sortTaxes;
