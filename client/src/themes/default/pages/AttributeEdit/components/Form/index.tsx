import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { AttributeType, AttributeEntity } from '@/stores/api/attributes';
import pick from 'lodash/pick';
import Fragment from '@/components/Fragment';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Option, Options } from '@/utils/formatOptions';
import type { Category } from '@/stores/api/categories';
import type { AttributeDetails, AttributeCreate } from '@/stores/api/attributes';

type Props = {
    /** Les données déjà sauvegardées de l'attribut (s'il existait déjà). */
    savedData?: AttributeDetails | null,

    /** Permet d'indiquer que la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation éventuelles. */
    errors?: Record<keyof AttributeCreate, string>,
};

type Data = {
    data: AttributeCreate,
};

const getDefaults = (savedData: AttributeDetails | null): AttributeCreate => {
    const BASE_DEFAULTS = {
        name: '',
        type: AttributeType.INTEGER,
        unit: '',
        max_length: '',
        is_totalisable: false,
    };

    return {
        ...BASE_DEFAULTS,
        ...pick(savedData ?? {}, Object.keys(BASE_DEFAULTS)),
        entities: [...(savedData?.entities ?? [AttributeEntity.MATERIAL])],
        categories: (savedData?.categories ?? []).map(({ id }: Category) => id),
    };
};

/** Formulaire d'édition d'un attribut de matériel. */
const AttributeEditForm = defineComponent({
    name: 'AttributeEditForm',
    provide: {
        verticalForm: true,
    },
    props: {
        savedData: {
            type: Object as PropType<Required<Props>['savedData']>,
            default: null,
        },
        isSaving: {
            type: Boolean as PropType<Required<Props>['isSaving']>,
            default: false,
        },
        errors: {
            type: Object as PropType<Required<Props>['errors']>,
            default: null,
        },
    },
    emits: ['submit', 'cancel'],
    data(): Data {
        return {
            data: getDefaults(this.savedData),
        };
    },
    computed: {
        isNew(): boolean {
            return this.savedData === null;
        },

        categoriesOptions(): Options<Category> {
            return this.$store.getters['categories/options'];
        },

        typesOptions(): Array<{ value: AttributeType, label: string }> {
            const { $t: __ } = this;

            return [
                { value: AttributeType.INTEGER, label: __('page.attribute-edit.type-integer') },
                { value: AttributeType.FLOAT, label: __('page.attribute-edit.type-float') },
                { value: AttributeType.DATE, label: __('page.attribute-edit.type-date') },
                { value: AttributeType.STRING, label: __('page.attribute-edit.type-string') },
                { value: AttributeType.TEXT, label: __('page.attribute-edit.type-text') },
                { value: AttributeType.BOOLEAN, label: __('page.attribute-edit.type-boolean') },
            ];
        },

        hasMaxLength(): boolean {
            const { type } = this.data;
            return type === 'string';
        },

        isNumber(): boolean {
            const { type } = this.data;
            return !!type && [AttributeType.INTEGER, AttributeType.FLOAT].includes(type);
        },
    },
    mounted() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleToggleCategory(categoryId: Category['id']) {
            const { categories } = this.data;

            const foundIndex = categories.indexOf(categoryId);
            if (foundIndex === -1) {
                categories.push(categoryId);
                return;
            }
            categories.splice(foundIndex, 1);
        },

        handleSubmit(e: SubmitEvent) {
            e.preventDefault();

            const { isNew, data: rawData, isNumber } = this;
            const {
                name,
                type,
                categories,
                unit,
                max_length: maxLength,
                is_totalisable: isTotalisable,
                entities,
            } = rawData;

            const data: AttributeCreate = {
                name,
                entities,
                categories,
            };

            if (isNew) {
                // Ici le type est forcément défini (cf. DEFAULT_VALUES)
                data.type = type!;
            }

            if (isNumber && unit) {
                data.unit = unit;
                data.is_totalisable = !!isTotalisable;
            }

            if (type === AttributeType.STRING) {
                data.max_length = maxLength ?? null;
            }

            this.$emit('submit', data);
        },

        handleCancel() {
            this.$emit('cancel');
        },
    },
    render() {
        const {
            $t: __,
            data,
            errors,
            isNew,
            typesOptions,
            isNumber,
            isSaving,
            hasMaxLength,
            categoriesOptions,
            handleToggleCategory,
            handleSubmit,
            handleCancel,
        } = this;

        return (
            <form
                class="Form Form--fixed-actions AttributeEditForm"
                onSubmit={handleSubmit}
            >
                <Fieldset>
                    <FormField
                        label={__('page.attribute-edit.name')}
                        class="AttributeEditForm__name"
                        v-model={data.name}
                        error={errors?.name}
                        autocomplete="off"
                        required
                    />
                    <FormField
                        type="select"
                        label={__('page.attribute-edit.type')}
                        class="AttributeEditForm__type"
                        options={typesOptions}
                        v-model={data.type}
                        error={errors?.type}
                        placeholder={false}
                        disabled={!isNew}
                        help={isNew ? null : __('page.attribute-edit.type-not-modifiable')}
                    />
                    {isNumber && (
                        <Fragment>
                            <FormField
                                label={__('page.attribute-edit.unit')}
                                class="AttributeEditForm__unit"
                                v-model={data.unit}
                                error={errors?.unit}
                            />
                            <FormField
                                type="switch"
                                label={__('page.attribute-edit.is-totalisable')}
                                class="AttributeEditForm__is-totalisable"
                                v-model={data.is_totalisable}
                                error={errors?.is_totalisable}
                            />
                            <p class="AttributeEditForm__is-totalisable-help">
                                {__('page.attribute-edit.totalisable-help')}
                            </p>
                        </Fragment>
                    )}
                    {hasMaxLength && (
                        <FormField
                            type="number"
                            label={__('page.attribute-edit.max-length')}
                            class="AttributeEditForm__max-length"
                            v-model={data.max_length}
                            error={errors?.max_length}
                            step={1}
                        />
                    )}
                    {categoriesOptions.length > 0 && (
                        <FormField
                            type="custom"
                            label={__('page.attribute-edit.limit-to-categories')}
                            class="AttributeEditForm__categories"
                            error={errors?.categories}
                            help={__('page.attribute-edit.limit-to-categories-help')}
                            required
                        >
                            <div class="AttributeEditForm__categories__choices">
                                {categoriesOptions.map(({ label, value: categoryId }: Option<Category>) => {
                                    const isSelected = data.categories.includes(categoryId);
                                    return (
                                        <span
                                            key={categoryId}
                                            onClick={() => { handleToggleCategory(categoryId); }}
                                            class={['AttributeEditForm__categories__item', {
                                                'AttributeEditForm__categories__item--selected': isSelected,
                                            }]}
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </FormField>
                    )}
                </Fieldset>
                <section class="Form__actions">
                    <Button htmlType="submit" type="primary" icon="save" loading={isSaving}>
                        {isSaving ? __('saving') : __('save')}
                    </Button>
                    <Button icon="ban" onClick={handleCancel}>
                        {__('cancel')}
                    </Button>
                </section>
            </form>
        );
    },
});

export default AttributeEditForm;
