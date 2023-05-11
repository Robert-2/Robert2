/* eslint-disable import/prefer-default-export */

import TinyColor from 'tinycolor2';

import type { ColorObject, HslaColorObject, HsvaColorObject } from './_types';

const getAdvancedColorRegex = (unit: string, withAlpha: boolean): RegExp => {
    const CSS_INTEGER = '[-\\+]?\\d+%?'; // http://www.w3.org/TR/css3-values/#integers
    const CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?'; // http://www.w3.org/TR/css3-values/#number-value

    const parts = Array.from({ length: withAlpha ? 4 : 3 })
        .fill(`((?:${CSS_NUMBER})|(?:${CSS_INTEGER}))`)
        .join('[,|\\s]+');

    return new RegExp(`^${unit}[\\s|\\(]+${parts}\\s*\\)?$`);
};

const parseAngle = (rawAngle: unknown): number => {
    if (typeof rawAngle !== 'string' && typeof rawAngle !== 'number') {
        return 0;
    }

    let parsedAngle = typeof rawAngle === 'string' ? parseInt(rawAngle, 10) : rawAngle;
    if (typeof rawAngle === 'string' && rawAngle.includes('%')) {
        parsedAngle = (parsedAngle * 360) / 100;
    }

    return Math.min(360, Math.max(0, parsedAngle));
};

const parsePercentage = (rawNumber: unknown): number => {
    if (typeof rawNumber !== 'string' && typeof rawNumber !== 'number') {
        return 1;
    }

    let parsedNumber = typeof rawNumber === 'string' ? parseFloat(rawNumber) : rawNumber;

    // - Si le nombre est <= 1 et que ce n'était pas explicitement un pourcentage, on le transforme (e.g. `0.1` => '10').
    if (typeof rawNumber !== 'string' || !rawNumber.includes('%')) {
        parsedNumber = parsedNumber <= 1 ? parsedNumber * 100 : parsedNumber;
    }

    // @see https://github.com/bgrins/TinyColor/blob/1.6.0/npm/esm/tinycolor.js#L956
    if (typeof rawNumber === 'string' && rawNumber.includes('.') && parsedNumber === 1) {
        return 1;
    }

    parsedNumber = Math.min(100, Math.max(0, parsedNumber));

    // - Gérer les erreurs d'arrondi des virgules flottante.
    // @see https://github.com/bgrins/TinyColor/blob/1.6.0/npm/esm/tinycolor.js#L966
    if (Math.abs(parsedNumber - 100) < 0.000_001) {
        return 1;
    }

    return parsedNumber / 100;
};

const parseAlpha = (rawAlpha: unknown): number => {
    if (typeof rawAlpha !== 'string' && typeof rawAlpha !== 'number') {
        return 1;
    }

    let parsedAlpha = typeof rawAlpha === 'string' ? parseFloat(rawAlpha) : rawAlpha;
    if (Number.isNaN(parsedAlpha) || parsedAlpha < 0 || parsedAlpha > 1) {
        parsedAlpha = 1;
    }

    return parsedAlpha;
};

const colorStringToObject = (colorString: string): ColorObject | null => {
    colorString = colorString
        .replace(/^\s+/, '')
        .replace(/\s+$/, '')
        .toLowerCase();

    const prefix = colorString.substring(0, 3);
    if (!['hsl', 'hsv'].includes(prefix)) {
        return (new TinyColor(colorString)).toRgb();
    }

    let match;
    /* eslint-disable no-cond-assign */
    if (match = getAdvancedColorRegex('hsl', false).exec(colorString)) {
        return {
            h: parseAngle(match[1]),
            s: parsePercentage(match[2]),
            l: parsePercentage(match[3]),
        };
    }
    if (match = getAdvancedColorRegex('hsla', true).exec(colorString)) {
        return {
            h: parseAngle(match[1]),
            s: parsePercentage(match[2]),
            l: parsePercentage(match[3]),
            a: parseAlpha(match[4]),
        };
    }
    if (match = getAdvancedColorRegex('hsv', false).exec(colorString)) {
        return {
            h: parseAngle(match[1]),
            s: parsePercentage(match[2]),
            v: parsePercentage(match[3]),
        };
    }
    if (match = getAdvancedColorRegex('hsva', true).exec(colorString)) {
        return {
            h: parseAngle(match[1]),
            s: parsePercentage(match[2]),
            v: parsePercentage(match[3]),
            a: parseAlpha(match[4]),
        };
    }
    /* eslint-enable no-cond-assign */

    return null;
};

export const parseColor = (rawColor: unknown): HsvaColorObject => {
    const color = new TinyColor(rawColor as any);
    if (rawColor === null || !color.isValid()) {
        throw new Error('This color seems invalid, it can not be parsed.');
    }

    const format = color.getFormat();
    const hsva = color.toHsv();

    if (!['hsl', 'hsv'].includes(format)) {
        return hsva;
    }

    if (typeof rawColor === 'string') {
        const colorObject = colorStringToObject(rawColor) as HslaColorObject | HsvaColorObject;
        return colorObject !== null ? { ...hsva, h: colorObject.h, s: colorObject.s } : hsva;
    }

    if (typeof rawColor === 'object') {
        const h = 'h' in rawColor ? parseAngle(rawColor.h) : hsva.h;
        const s = 's' in rawColor ? parsePercentage(rawColor.s) : hsva.s;
        return { ...hsva, h, s };
    }

    return hsva;
};
