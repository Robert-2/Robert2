import './index.scss';
import invariant from 'invariant';
import { defineComponent } from '@vue/composition-api';
import { groupByCategories /* groupByParks */ } from './_utils';
import Item from './Item';

import type { AwaitedMaterial, AwaitedMaterialGroup } from './_utils';

export type { AwaitedMaterial };

export enum DisplayGroup {
    /** Tri par catégories. */
    CATEGORIES = 'categories',

    // /** Tri par parcs. */
    // PARKS = 'parks',

    /** Pas de tri. */
    NONE = 'none',
}

export type InventoryMaterialError = {
    id: AwaitedMaterial['id'],
    message?: string,
};

export type InventoryMaterialQuantities = {
    actual: number,
    broken: number,
};

export type InventoryMaterial = (
    & { id: AwaitedMaterial['id'] }
    & InventoryMaterialQuantities
);

export type InventoryData = InventoryMaterial[];

type Props = {
    /**
     * Le matériel attendu dans l'inventaire.
     *
     * Ceci doit être un tableau d'objets `Material` avec en plus les clés suivantes:
     * - `awaited_quantity`: La quantité attendu pour ce matériel (et non la quantité en stock).
     */
    materials: AwaitedMaterial[],

    /**
     * L'inventaire déjà réalisé (le cas échéant).
     *
     * Doit contenir un tableau d'objets au format suivant:
     * - `id`: L'identifiant du matériel (existant dans la prop `materials` donc) dont c'est l'inventaire.
     * - `actual`: La quantité effectivement inventoriée pour le matériel.
     * - `broken`: La quantité inventoriée cassée pour le matériel.
     */
    inventory: InventoryData,

    /** L'affichage par groupe à utiliser. */
    displayGroup?: DisplayGroup,

    /** Permet de "verrouiller" l'inventaire (= Lecture seule). */
    locked?: boolean | string[],

    /**
     * Permet d'activer ou non le mode "strict".
     *
     * Si activé, il ne sera pas possible de spécifier une plus grande
     * quantité qu'attendue pour chaque matériel inventorié.
     */
    strict?: boolean,

    /**
     * Une liste d'erreurs pour certains matériels (si nécessaire).
     *
     * Doit contenir un tableau d'objets au format suivant:
     * - `id`: L'identifiant du matériel (existant dans la prop `materials` donc).
     * - `message`: Un - éventuel - message d'erreur associé.
     */
    errors?: InventoryMaterialError[],
};

// @vue/component
const Inventory = defineComponent<Required<Props>>({
    name: 'Inventory',
    props: {
        materials: { type: Array, required: true },
        inventory: { type: Array, required: true },
        errors: { type: Array, default: () => [] },
        locked: { type: [Boolean, Array], default: false },
        strict: { type: Boolean, default: false },
        displayGroup: {
            default: DisplayGroup.CATEGORIES,
            validator: (displayGroup: unknown): boolean => (
                typeof displayGroup === 'string' &&
                (Object.values(DisplayGroup) as string[]).includes(displayGroup)
            ),
        },
    },
    computed: {
        list(): AwaitedMaterialGroup[] {
            switch (this.displayGroup) {
                case DisplayGroup.CATEGORIES: {
                    const categories = this.$store.state.categories.list;
                    return groupByCategories(this.materials, categories);
                }
                // case DisplayGroup.PARKS: {
                //     const parks = this.$store.state.parks.list;
                //     // return dispatchMaterialInSections(this.materials, 'park_id', parks);
                //     return groupByParks(this.materials, parks);
                // }
                default:
                    return [{ id: null, name: null, materials: this.materials }];
            }
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
        this.$store.dispatch('parks/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleChange(materialId: AwaitedMaterial['id'], quantities: InventoryMaterialQuantities) {
            if (this.locked === true) {
                return;
            }
            this.$emit('change', materialId, quantities);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        getMaterialQuantities(materialId: AwaitedMaterial['id']): InventoryMaterialQuantities {
            const material = this.materials.find((_material: AwaitedMaterial) => _material.id === materialId);
            invariant(material, 'The requested material is not part of the inventory.');

            const rawQuantities = this.inventory.find(
                ({ id }: InventoryMaterial) => id === materialId,
            );

            const quantities: InventoryMaterialQuantities = {
                actual: rawQuantities?.actual ?? 0,
                broken: rawQuantities?.broken ?? 0,
            };

            return quantities;
        },

        getError(materialId: AwaitedMaterial['id']): InventoryMaterialError | undefined {
            if (!this.errors) {
                return undefined;
            }
            return this.errors.find(({ id }: InventoryMaterialError) => id === materialId);
        },
    },
    render() {
        const {
            $t: __,
            list,
            locked,
            strict,
            displayGroup,
            getMaterialQuantities,
            getError,
            handleChange,
        } = this;

        return (
            <div class="Inventory">
                {list.map(({ id: sectionId, name: sectionName, materials }: AwaitedMaterialGroup) => {
                    const key = sectionId ?? (displayGroup !== DisplayGroup.NONE ? null : 'flat');
                    return (
                        <div key={key} class="Inventory__section">
                            <div class="Inventory__section__header">
                                {displayGroup !== DisplayGroup.NONE && (
                                    <h3 class="Inventory__section__title">
                                        {sectionName ?? __('not-categorized')}
                                    </h3>
                                )}
                                <div class="Inventory__section__columns">
                                    <h3 class="Inventory__section__quantity-title">
                                        {__('actual-qty')}
                                    </h3>
                                    <h3 class="Inventory__section__quantity-title">
                                        {__('out-of-order-qty')}
                                    </h3>
                                </div>
                            </div>
                            <div class="Inventory__list">
                                {materials.map((material: AwaitedMaterial) => (
                                    <Item
                                        ref={`items[${material.id}]`}
                                        key={material.id}
                                        material={material}
                                        quantities={getMaterialQuantities(material.id)}
                                        error={getError(material.id)}
                                        locked={locked}
                                        strict={strict}
                                        onChange={handleChange}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    },
});

export default Inventory;
