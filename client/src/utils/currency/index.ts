import invariant from 'invariant';
import currencies from './_data';

import type { CurrencyData } from './_data';

class Currency {
    private _name: string;

    private _code: string;

    private _symbol: string | undefined;

    constructor(code: string | Currency) {
        this._code = !(code instanceof Currency)
            ? code.toUpperCase()
            : code.code;

        // - Retrieve the currency data.
        const data: CurrencyData | undefined = currencies.find(
            (_datum: CurrencyData) => _datum.code === this._code,
        );
        invariant(data !== undefined, `Unknown currency: "${this._code}".`);

        this._name = data?.name ?? this._code;
        this._symbol = data?.symbol;
    }

    /**
     * Returns the currency name.
     *
     * @returns The currency name.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Returns the currency code.
     *
     * @returns The currency code.
     */
    public get code(): string {
        return this._code;
    }

    /**
     * Returns the currency symbol.
     *
     * @returns The currency symbol.
     */
    public get symbol(): string {
        return this._symbol ?? this._code;
    }

    /**
     * Retourne `true` si la devise est identique à une autre.
     *
     * @param other - La devise avec laquelle il faut comparer.
     *
     * @returns `true` si les devises sont identiques, `false` sinon.
     */
    public isSame(other: Currency): boolean {
        return this.code === other.code;
    }
}

export default Currency;
