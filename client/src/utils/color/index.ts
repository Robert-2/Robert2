import TinyColor from 'tinycolor2';
import { parseColor } from './_utils';

import type { Instance as TinyColorInstance } from 'tinycolor2';
import type {
    HexColorString,
    HsvaColorObject,
    RgbaColorString,
    RawColor,
} from './_types';

class Color {
    private hsva: HsvaColorObject;

    private tinyColor: TinyColorInstance;

    constructor(color: RawColor | Color) {
        const parsedColor = !(color instanceof Color)
            ? parseColor(color)
            : color.toHsv();

        if (parsedColor === null) {
            throw new Error('This color seems invalid, it can not be parsed.');
        }

        this.hsva = parsedColor;
        this.tinyColor = new TinyColor(parsedColor);
    }

    /**
     * Permet de savoir si la couleur courante est sombre.
     *
     * Cela peut-être utile pour savoir quel couleur de texte utiliser
     * si la couleur est mise en fond de celui-ci.
     *
     * @returns `true` si la couleur est foncée, `false` sinon.
     */
    public isDark(): boolean {
        return this.tinyColor.isDark();
    }

    /**
     * Retourne la teinte (= Hue) de la couleur.
     *
     * @returns La teinte (= hue) sous forme de nombre (entre 1 et 100).
     */
    public getHue(): number {
        return this.hsva.h;
    }

    /**
     * Retourne la transparence de la couleur.
     *
     * @returns La transparence sous forme de nombre (entre 0 et 1).
     */
    public getAlpha(): number {
        return this.hsva.a;
    }

    /**
     * Retourne la couleur sous forme d'objet HSVA.
     *
     * @returns La couleur sous forme d'objet HSVA (e.g. `{ h: 0, s: 100, v: 0, a: 1 }`).
     */
    public toHsv(): HsvaColorObject {
        return { ...this.hsva };
    }

    /**
     * Retourne la couleur sous forme de chaîne de caractères hexadécimale.
     *
     * @returns La couleur sous forme de chaîne de caractères hexadécimale (e.g. `#000000`).
     */
    public toHexString(): HexColorString {
        return this.tinyColor.toHexString() as HexColorString;
    }

    /**
     * Retourne la couleur sous forme de chaîne de caractères RGBA.
     *
     * @returns La couleur sous forme de chaîne de caractères RGBA (e.g. `rgba(255, 255, 255, 0.5)`).
     */
    public toRgbaString(): RgbaColorString {
        return this.tinyColor.toRgbString().toLowerCase() as RgbaColorString;
    }

    /**
     * Retourne la couleur sous forme de chaîne de caractères.
     *
     * Si la couleur contient de la transparence, une chaîne de caractère RGBA
     * (e.g. `rgba(255, 255, 255, 0.5)`) sera retournée, sinon une chaîne de
     * caractères hexadécimale (e.g. `#ffffff`) sera retournée.
     *
     * @returns La couleur sous forme de chaîne de caractères (hexadécimale ou rgba si transparence).
     */
    public toString(): HexColorString | RgbaColorString {
        return this.getAlpha() < 1 ? this.toRgbaString() : this.toHexString();
    }

    /**
     * Retourne l'instance sous forme serializable dans un objet JSON.
     *
     * Note: Ce format pourra être ré-utilisé en entrée.
     *
     * @returns L'instance sous forme sérialisée.
     */
    public toJSON(): HexColorString | RgbaColorString {
        return this.toString();
    }

    /**
     * Permet de créer une nouvelle instance de `Color` avec une nouvelle teinte.
     * (en gardant les autres propriétés de la précédente couleur)
     *
     * @param hue - La nouvelle teinte à utiliser.
     *
     * @returns Une nouvelle couleur héritant de toutes les propriétés de
     *          l'ancienne sauf la nouvelle teinte.
     */
    public withHue(hue: number): Color {
        return new Color({ ...this.toHsv(), h: hue });
    }

    /**
     * Permet de créer une nouvelle instance de `Color` avec une nouvelle valeur de transparence.
     * (en gardant les autres propriétés de la précédente couleur)
     *
     * @param alpha - La nouvelle valeur de transparence à utiliser.
     *
     * @returns Une nouvelle couleur héritant de toutes les propriétés de
     *          l'ancienne sauf la nouvelle valeur de transparence.
     */
    public withAlpha(alpha: number): Color {
        return new Color({ ...this.toHsv(), a: alpha });
    }

    /**
     * Indique si une couleur est valide ou non.
     *
     * @param color - La couleur dont on veut vérifier la validité.
     *
     * @returns `true` si la couleur est valide, `false` sinon.
     */
    public static isValid(color: unknown): color is RawColor | Color {
        if (color instanceof Color) {
            return true;
        }
        return parseColor(color) !== null;
    }
}

export type * from './_types';
export default Color;
