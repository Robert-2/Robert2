import type { ColorFormats } from 'tinycolor2';

// - Hexadécimal.
export type HexColorString = `#${string}`;
export type HexColorRaw = HexColorString;

// - RGB.
export type RgbColorString = `rgb(${string})` | `RGB(${string})`;
export type RgbColorObject = ColorFormats.RGB;
export type RgbColorRaw = RgbColorString | RgbColorObject;

// - RGBA.
export type RgbaColorString = `rgba(${string})` | `RGBA(${string})`;
export type RgbaColorObject = ColorFormats.RGBA;
export type RgbaColorRaw = RgbaColorString | RgbaColorObject;

// - HSL.
export type HslColorString = `hsl(${string})` | `HSL(${string})`;
export type HslColorObject = ColorFormats.HSL;
export type HslColorRaw = HslColorString | HslColorObject;

// - HSLA.
export type HslaColorString = `hsla(${string})` | `HSLA(${string})`;
export type HslaColorObject = ColorFormats.HSLA;
export type HslaColorRaw = HslaColorString | HslaColorObject;

// - HSV.
export type HsvColorString = `hsv(${string})` | `HSV(${string})`;
export type HsvColorObject = ColorFormats.HSV;
export type HsvColorRaw = HsvColorString | HsvColorObject;

// - HSVA.
export type HsvaColorString = `hsva(${string})` | `HSVA(${string})`;
export type HsvaColorObject = ColorFormats.HSVA;
export type HsvaColorRaw = HsvaColorString | HsvaColorObject;

export type ColorObject = (
    | RgbColorObject
    | RgbaColorObject
    | HslColorObject
    | HslaColorObject
    | HsvColorObject
    | HsvaColorObject
);

/** Une couleur "brute", peu importe son format. */
export type RawColor = (
    | HexColorRaw
    | RgbColorRaw
    | RgbaColorRaw
    | HslColorRaw
    | HslaColorRaw
    | HsvColorRaw
    | HsvaColorRaw
);
