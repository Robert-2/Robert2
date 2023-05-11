import './index.scss';
import { defineComponent } from '@vue/composition-api';
import pick from 'lodash/pick';
import Fragment from '@/components/Fragment';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { Attribute, AttributeEdit, AttributeType } from '@/stores/api/attributes';
import type { Category } from '@/stores/api/categories';

type Props = {
    /** Les données de l'attribut actuellement sauvées en BDD. */
    savedData?: Attribute | null,

    /** Pour indiquer quand la sauvegarde est en cours. */
    isSaving?: boolean,

    /** Liste des erreurs de validation. */
    errors?: Record<keyof AttributeEdit, string[]>,
};

type CategoryOption = {
    label: string,
    value: Category['id'],
};

type Data = {
    attribute: AttributeEdit,
    hasCriticalError: boolean,
};

const DEFAULT_VALUES: AttributeEdit = Object.freeze({
    name: '',
    type: 'integer',
    unit: '',
    isTotalisable: false,
    maxLength: '',
    categories: [],
});

// @vue/component
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
    data(): Data {
        const attribute = {
            ...DEFAULT_VALUES,
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
            categories: this.savedData?.categories.map(({ id }: Category) => id) ?? [],
        };

        return {
            attribute,
            hasCriticalError: false,
        };
    },
    computed: {
        isNew(): boolean {
            return this.savedData === null;
        },

        categoriesOptions(): CategoryOption[] {
            return this.$store.getters['categories/options'] as CategoryOption[];
        },

        typesOptions(): Array<{ value: AttributeType, label: string }> {
            const { $t: __ } = this;

            return [
                { value: 'integer', label: __('page.attribute-edit.type-integer') },
                { value: 'float', label: __('page.attribute-edit.type-float') },
                { value: 'date', label: __('page.attribute-edit.type-date') },
                { value: 'string', label: __('page.attribute-edit.type-string') },
                { value: 'boolean', label: __('page.attribute-edit.type-boolean') },
            ];
        },

        hasMaxLength(): boolean {
            const { type } = this.attribute;
            return type === 'string';
        },

        isNumber(): boolean {
            const { type } = this.attribute;
            return !!type && ['integer', 'float'].includes(type);
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
            const { categories } = this.attribute;

            const foundIndex = categories.indexOf(categoryId);
            if (foundIndex === -1) {
                categories.push(categoryId);
                return;
            }
            categories.splice(foundIndex, 1);
        },

        handleSubmit(e: SubmitEvent) {
            e.preventDefault();
            const { isNew, attribute, isNumber } = this;
            const { name, type, categories, unit, isTotalisable, maxLength } = attribute;

            const data: AttributeEdit = { name, categories };
            if (isNew) {
                // Ici le type est forcément défini (cf. DEFAULT_VALUES)
                data.type = type!;
            }

            if (isNumber && unit) {
                data.unit = unit;
                data.isTotalisable = !!isTotalisable;
            }

            if (type === 'string') {
                data.maxLength = maxLength || null;
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
            attribute,
            errors,
            isNew,
            typesOptions,
            isNumber,
            hasMaxLength,
            categoriesOptions,
            handleToggleCategory,
            handleSubmit,
            handleCancel,
            isSaving,
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
                        v-model={attribute.name}
                        errors={errors?.name}
                        autocomplete="off"
                        required
                    />
                    <FormField
                        type="select"
                        label={__('page.attribute-edit.type')}
                        class="AttributeEditForm__type"
                        options={typesOptions}
                        v-model={attribute.type}
                        errors={errors?.type}
                        placeholder={false}
                        disabled={!isNew}
                        help={isNew ? null : __('page.attribute-edit.type-not-modifiable')}
                    />
                    {isNumber && (
                        <Fragment>
                            <FormField
                                label={__('page.attribute-edit.unit')}
                                class="AttributeEditForm__unit"
                                v-model={attribute.unit}
                                errors={errors?.unit}
                            />
                            <FormField
                                type="switch"
                                label={__('page.attribute-edit.is-totalisable')}
                                class="AttributeEditForm__is-totalisable"
                                v-model={attribute.isTotalisable}
                                errors={errors?.isTotalisable}
                            />
                            <p class="AttributeEditForm__is-totalisable-help">
                                {__('page.attribute-edit.totalisable-help')}
                            </p>
                        </Fragment>
                    )}
                    {hasMaxLength && (
                        <Fragment>
                            <FormField
                                type="number"
                                label={__('page.attribute-edit.max-length')}
                                class="AttributeEditForm__max-length"
                                v-model={attribute.maxLength}
                                errors={errors?.maxLength}
                                step={1}
                            />
                        </Fragment>
                    )}
                </Fieldset>
                {categoriesOptions.length > 0 && (
                    <Fieldset class="AttributeEditForm__categories">
                        <p class="AttributeEditForm__categories__label">
                            {__('page.attribute-edit.limit-to-categories')}
                        </p>
                        {categoriesOptions.map(({ label, value: categoryId }: CategoryOption) => {
                            const isSelected = attribute.categories.includes(categoryId);
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
                        <p class="AttributeEditForm__categories__help">
                            {__('page.attribute-edit.limit-to-categories-help')}
                        </p>
                    </Fieldset>
                )}
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
