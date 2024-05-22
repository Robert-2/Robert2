import './index.scss';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import config from '@/globals/config';
import formatAmount from '@/utils/formatAmount';
import TagsList from '@/themes/default/components/TagsList';
import Link from '@/themes/default/components/Link';
import formatAttributeValue from '@/utils/formatAttributeValue';
import { UNCATEGORIZED } from '@/stores/api/materials';

import type { PropType } from '@vue/composition-api';
import type { MaterialDetails } from '@/stores/api/materials';
import type { AttributeWithValue } from '@/stores/api/attributes';

type Props = {
    /** Le matériel dont on veut afficher les informations. */
    material: MaterialDetails,
};

/** Onglet "informations" de la page de détails d'un matériel. */
const MaterialViewInfos = defineComponent({
    name: 'MaterialViewInfos',
    props: {
        material: {
            type: Object as PropType<Props['material']>,
            required: true,
        },
    },
    computed: {
        isBillingEnabled(): boolean {
            return config.billingMode !== 'none';
        },

        categoryName(): string {
            const { $t: __, material } = this;
            const { category_id: categoryId } = material;
            const categoryNameGetter = this.$store.getters['categories/categoryName'];
            return categoryNameGetter(categoryId) ?? __('not-categorized');
        },

        subCategoryName(): string {
            const { sub_category_id: subCategoryId } = this.material;
            const subCategoryNameGetter = this.$store.getters['categories/subCategoryName'];
            return subCategoryNameGetter(subCategoryId);
        },

        hasMultipleParks(): boolean {
            return this.$store.state.parks.list.length > 1;
        },

        parkName(): string {
            const { park_id: parkId } = this.material;
            return this.$store.getters['parks/parkName'](parkId);
        },

        rentalPrice(): string | null {
            if (!this.isBillingEnabled) {
                return null;
            }

            const { rental_price: rentalPrice } = this.material;
            return rentalPrice ? formatAmount(rentalPrice) : null;
        },

        replacementPrice(): string | null {
            const { replacement_price: replacementPrice } = this.material;
            return replacementPrice ? formatAmount(replacementPrice) : null;
        },

        hasPricingData(): boolean {
            return (
                this.rentalPrice !== null ||
                this.replacementPrice !== null
            );
        },
    },
    mounted() {
        this.$store.dispatch('parks/fetch');
    },
    render() {
        const {
            $t: __,
            categoryName,
            subCategoryName,
            isBillingEnabled,
            hasPricingData,
            rentalPrice,
            replacementPrice,
            material,
            hasMultipleParks,
            parkName,
        } = this;

        const {
            reference,
            name,
            description,
            stock_quantity: stockQuantity,
            out_of_order_quantity: outOfOrderQuantity,
            is_hidden_on_bill: isHiddenOnBill,
            is_discountable: isDiscountable,
            attributes,
            picture,
            note,
            tags,
        } = material;

        return (
            <div class="MaterialViewInfos">
                <div class="MaterialViewInfos__main">
                    <h2 class="MaterialViewInfos__reference">
                        {__('ref-ref', { reference })}
                    </h2>
                    <h3>
                        <Link
                            to={{
                                name: 'materials',
                                query: {
                                    category: material.category_id ?? UNCATEGORIZED,
                                },
                            }}
                        >
                            {categoryName}
                        </Link>
                        {!!subCategoryName && (
                            <Fragment>
                                {' / '}
                                <Link
                                    to={{
                                        name: 'materials',
                                        query: {
                                            category: material.category_id ?? UNCATEGORIZED,
                                            subCategory: material.sub_category_id,
                                        },
                                    }}
                                >
                                    {subCategoryName}
                                </Link>
                            </Fragment>
                        )}
                        {' / '}
                        {name}
                    </h3>
                    <p class="MaterialViewInfos__description">
                        {description}
                    </p>
                    <h3>{__('quantities')}</h3>
                    <ul>
                        <li class="MaterialViewInfos__stock-quantity">
                            {__('stock-items-count', { count: stockQuantity || 0 })}
                        </li>
                        {outOfOrderQuantity > 0 && (
                            <li class="MaterialViewInfos__out-of-order">
                                {__('out-of-order-items-count', { count: outOfOrderQuantity })}
                            </li>
                        )}
                    </ul>
                    {(isBillingEnabled && hasPricingData) && (
                        <div class="MaterialViewInfos__billing">
                            <h3>{__('prices')}</h3>
                            <ul>
                                {rentalPrice !== null && (
                                    <li class="MaterialViewInfos__rental-price">
                                        {__('value-per-day', { value: rentalPrice })}
                                    </li>
                                )}
                                {replacementPrice !== null && (
                                    <li>
                                        {__('replacement-price')} {replacementPrice}
                                    </li>
                                )}
                            </ul>
                            <h3>{__('billing')}</h3>
                            {isHiddenOnBill && (
                                <p>{__('material-not-displayed-on-invoice')}</p>
                            )}
                            {isDiscountable && (
                                <p>{__('material-is-discountable')}</p>
                            )}
                        </div>
                    )}
                    {attributes.length > 0 && (
                        <div class="MaterialViewInfos__attributes">
                            <h3>{__('special-attributes')}</h3>
                            {attributes.map((attribute: AttributeWithValue) => (
                                <dl key={attribute.id} class="MaterialViewInfos__attribute">
                                    <dt class="MaterialViewInfos__attribute__name">
                                        {__('label-colon', { label: attribute.name })}
                                    </dt>
                                    <dd class="MaterialViewInfos__attribute__value">
                                        {formatAttributeValue(__, attribute)}
                                    </dd>
                                </dl>
                            ))}
                        </div>
                    )}
                    {!!note && (
                        <div class="MaterialViewInfos__notes">
                            <h3>{__('notes')}</h3>
                            <p class="MaterialViewInfos__notes">{note}</p>
                        </div>
                    )}
                </div>
                <div class="MaterialViewInfos__secondary">
                    {!!picture && (
                        <section class="MaterialViewInfos__picture">
                            <a
                                href={picture}
                                target="blank"
                                title={__('page.material-view.infos.click-to-open-image')}
                                class="MaterialViewInfos__picture__link"
                            >
                                <img
                                    src={picture}
                                    alt={name}
                                    class="MaterialViewInfos__picture__img"
                                />
                            </a>
                        </section>
                    )}
                    <section class="MaterialViewInfos__extras">
                        {hasMultipleParks && (
                            <div class="MaterialViewInfos__extra MaterialViewInfos__extra--park">
                                <p class="MaterialViewInfos__extra__item">
                                    {__('page.material-view.infos.park-name', { name: parkName })}
                                </p>
                            </div>
                        )}
                        <div class="MaterialViewInfos__extra MaterialViewInfos__extra--categories">
                            <p class="MaterialViewInfos__extra__item">
                                {__('category')}: <strong>{categoryName}</strong>
                            </p>
                            {!!subCategoryName && (
                                <p class="MaterialViewInfos__extra__item">
                                    {__('sub-category')}: <strong>{subCategoryName}</strong>
                                </p>
                            )}
                        </div>
                        {!!(tags && tags.length > 0) && <TagsList tags={tags} />}
                        <div class="MaterialViewInfos__extra MaterialViewInfos__extra--dates">
                            <p class="MaterialViewInfos__extra__item">
                                {__('created-at', { date: material.created_at.toReadable() })}
                            </p>
                            {!!material.updated_at && (
                                <p class="MaterialViewInfos__extra__item">
                                    {__('updated-at', { date: material.updated_at.toReadable() })}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        );
    },
});

export default MaterialViewInfos;
