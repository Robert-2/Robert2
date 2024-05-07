import formatAttributeValue from '@/utils/formatAttributeValue';
import materials from '@fixtures/parsed/materials';

describe('formatAttributeValue', () => {
    const __ = (key: string): string => key;

    it('returns the formatted value of a string attribute', () => {
        const stringAttribute = materials.default(1).attributes[1];
        expect(formatAttributeValue(__, stringAttribute)).toBe('Grise');
    });

    it('returns the formatted value of an integer attribute', () => {
        const intAttribute = materials.default(1).attributes[2];
        expect(formatAttributeValue(__, intAttribute)).toBe(`850\u00A0W`);
    });

    it('returns the formatted value of a float attribute', () => {
        const floatAttribute = materials.default(1).attributes[0];
        expect(formatAttributeValue(__, floatAttribute)).toBe(`36.5\u00A0kg`);
    });

    it('returns the formatted value of a date attribute', () => {
        const dateAttribute = materials.default(6).attributes[0];
        expect(formatAttributeValue(__, dateAttribute)).toBe('01/28/2021');
    });

    it('returns the formatted value of a boolean attribute', () => {
        const booleanAttribute = materials.default(4).attributes[2];
        expect(formatAttributeValue(__, booleanAttribute)).toBe('yes');
    });
});
