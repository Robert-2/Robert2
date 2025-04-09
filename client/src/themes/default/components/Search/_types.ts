import type { Props as IconProps } from '@/themes/default/components/Icon';
import type { SetOptional, Simplify } from 'type-fest';

export type OptionValue = string | number;

export type Option<T extends OptionValue = OptionValue, D = unknown> = {
    /**
     * L'éventuel icône à utilise pour cette option.
     *
     * Doit contenir une chaîne de caractère avec les composantes suivantes séparées par `:` :
     * - Le nom de l'icône sous forme de chaîne (e.g. `plus`, `wrench`)
     *   Pour une liste exhaustive des codes, voir: https://fontawesome.com/v5.15/icons?m=free
     * - La variante à utiliser de l'icône à utiliser (`solid`, `regular`, ...).
     *
     * @example
     * - `wrench`
     * - `wrench:solid`
     */
    icon?: string | `${string}:${Required<IconProps>['variant']}` | undefined,

    /** Le libellé de l'option. */
    label: string,

    /** La valeur de l'option. */
    value: T,

    /** Est-ce l'option par défaut ? */
    default?: boolean,

    /** Éventuelles données additionnelles pour l'option. */
    data?: D,
};

export type TokenValue = string | number | Array<string | number>;

type TokenBase<T extends string | symbol, V extends TokenValue> = {
    id: string | number,
    type: T,
    value: V,
};

export type CustomToken<T extends string = string, V extends TokenValue = TokenValue> = TokenBase<T, V>;

export type Token =
    | CustomToken;

export type PartialToken =
    | Simplify<Omit<CustomToken, 'value'> & { value: CustomToken['value'] | null }>;

export type LooseToken =
    | Simplify<SetOptional<CustomToken, 'id'>>;

export type LoosePartialToken =
    | Simplify<
        & { value: CustomToken['value'] | null }
    >;

export type RawCustomToken<T extends string = string, V extends TokenValue = TokenValue> = (
    Simplify<Omit<CustomToken<T, V>, 'id'>>
);

export type RawToken =
    | RawCustomToken
    | string;

export type TokenOption<
    T extends string | number = string | number,
    D = unknown,
> = Option<T, D>;

export type TokenOptions<
    T extends string | number = string | number,
    D = unknown,
> = Array<TokenOption<T, D>>;

type TokenDefinitionBase<T extends TokenOption> = {
    /**
     * Identifiant unique du type de token (= Un identifiant
     * quelconque ayant du sens pour l'utilisateur du component).
     *
     * Ce type doit être unique dans la liste des tokens disponibles car chaque
     * valeur ayant ce type utilisera la première configuration correspondante
     * définie dans cette prop.
     */
    type: CustomToken['type'],

    /**
     * L'éventuel icône à utiliser pour le token.
     *
     * Doit contenir une chaîne de caractère avec les composantes suivantes séparées par `:` :
     * - Le nom de l'icône sous forme de chaîne (e.g. `plus`, `wrench`)
     *   Pour une liste exhaustive des codes, voir: https://fontawesome.com/v5.15/icons?m=free
     * - La variante à utiliser de l'icône à utiliser (`solid`, `regular`, ...).
     *
     * @example
     * - `wrench`
     * - `wrench:solid`
     */
    icon?: string | `${string}:${Required<IconProps>['variant']}`,

    /**
     * Le titre du token tel qu'il sera affiché à l'utilisateur
     * final (e.g. "Parcs", "Auteurs").
     */
    title: string,

    /**
     * Les options à proposer pour ce token.
     * (e.g. La liste des utilisateurs pour un token de type "Utilisateur")
     */
    options: T[],

    /**
     * Est-ce que ce type de token ne peut être présent qu'une seule fois ?
     * Si c'est le cas il ne sera donc pas possible de définir plusieurs valeur (e.g. "A" ou B").
     *
     * @default true
     */
    unique?: boolean,

    /**
     * Est-ce que le type de token est désactivé ?
     *
     * @default false
     */
    disabled?: boolean,
};

export type TokenDefinition<T extends TokenOption = TokenOption> = (
    & TokenDefinitionBase<T>
    & (
        | {
            /**
             * Est-ce que l'on doit autoriser la sélection de plusieurs valeurs pour un seul token ?
             *
             * Cette option diffère de `unique` dans le sens ou `unique` permet la sélection de
             * plusieurs valeurs pour un même type dans plusieurs tokens différents avec éventuellement
             * des opérateurs différents.
             *
             * @default false
             */
            multiSelect?: false,

            /**
             * Une éventuelle fonction de rendu pour customiser l'affichage
             * des options et/ou valeur(s) sélectionnée(s).
             */
            render?(option: T, asSelection: boolean): JSX.Node | null,
        }
        | {
            /**
             * Est-ce que l'on doit autoriser la sélection de plusieurs valeurs pour un seul token ?
             *
             * Cette option diffère de `unique` dans le sens ou `unique` permet la sélection de
             * plusieurs valeurs pour un même type dans plusieurs tokens différents avec éventuellement
             * des opérateurs différents.
             *
             * @default false
             */
            multiSelect: true,

            /**
             * Une éventuelle fonction de rendu pour customiser l'affichage
             * des options et/ou valeur(s) sélectionnée(s).
             */
            render?(options: T[], asSelection: true): JSX.Node | null,
            render?(options: T, asSelection: false): JSX.Node | null,
        }
    )
);
