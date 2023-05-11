import Color from '@/utils/color';

describe('Utils / Color', () => {
    it('should keep the hue infos for red color', () => {
        // - Angle: 0°
        expect(new Color('hsv(0, 100%, 100%)').toHsv()).toEqual({ h: 0, s: 1, v: 1, a: 1 });
        expect(new Color('hsl(0, 100%, 50%)').toHsv()).toEqual({ h: 0, s: 1, v: 1, a: 1 });
        expect(new Color('hsv(0, 1, 1)').toHsv()).toEqual({ h: 0, s: 1, v: 1, a: 1 });
        expect(new Color({ h: 0, s: 1, v: 1 }).toHsv()).toEqual({ h: 0, s: 1, v: 1, a: 1 });

        // - Angle: 360°
        expect(new Color('hsv(360, 100%, 100%)').toHsv()).toEqual({ h: 360, s: 1, v: 1, a: 1 });
        expect(new Color('hsl(360, 100%, 50%)').toHsv()).toEqual({ h: 360, s: 1, v: 1, a: 1 });
        expect(new Color('hsv(360, 1, 1)').toHsv()).toEqual({ h: 360, s: 1, v: 1, a: 1 });
        expect(new Color({ h: 360, s: 1, v: 1 }).toHsv()).toEqual({ h: 360, s: 1, v: 1, a: 1 });
    });

    it('should keep the hue + saturation infos for black color', () => {
        expect(new Color('hsv(0, 0%, 0)').toHsv()).toEqual({ h: 0, s: 0, v: 0, a: 1 });
        expect(new Color({ h: 0, s: 0, v: 0 }).toHsv()).toEqual({ h: 0, s: 0, v: 0, a: 1 });

        expect(new Color('hsv(50, 0%, 0)').toHsv()).toEqual({ h: 50, s: 0, v: 0, a: 1 });
        expect(new Color({ h: 50, s: 0, v: 0 }).toHsv()).toEqual({ h: 50, s: 0, v: 0, a: 1 });

        expect(new Color('hsv(160, 100%, 0)').toHsv()).toEqual({ h: 160, s: 1, v: 0, a: 1 });
        expect(new Color({ h: 160, s: 1, v: 0 }).toHsv()).toEqual({ h: 160, s: 1, v: 0, a: 1 });
    });

    it('should keep the hue info for white color', () => {
        expect(new Color('hsv(0, 0%, 100)').toHsv()).toEqual({ h: 0, s: 0, v: 1, a: 1 });
        expect(new Color({ h: 0, s: 0, v: 100 }).toHsv()).toEqual({ h: 0, s: 0, v: 1, a: 1 });

        expect(new Color('hsv(50, 0%, 100)').toHsv()).toEqual({ h: 50, s: 0, v: 1, a: 1 });
        expect(new Color({ h: 50, s: 0, v: 100 }).toHsv()).toEqual({ h: 50, s: 0, v: 1, a: 1 });
    });
});
