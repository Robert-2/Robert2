import './index.scss';
import formatAmount from '@/utils/formatAmount';
import dispatchMaterialInSections from '@/utils/dispatchMaterialInSections';

export default {
    name: 'EventMaterials',
    props: {
        materials: Array,
        start: Object,
        end: Object,
        withRentalPrices: { type: Boolean, default: true },
        hideDetails: { type: Boolean, default: false },
    },
    data() {
        return { showMaterialsList: !this.hideDetails };
    },
    computed: {
        categories() {
            const categoryNameGetter = this.$store.getters['categories/categoryName'];
            return dispatchMaterialInSections(
                this.materials,
                'category_id',
                categoryNameGetter,
                'price',
            );
        },
    },
    created() {
        this.$store.dispatch('categories/fetch');
    },
    methods: {
        formatAmount(amount) {
            return formatAmount(amount);
        },
    },
    render() {
        const {
            $t: __,
            materials,
            categories,
            showMaterialsList,
            withRentalPrices,
        } = this;

        return (
            <div class="EventMaterials">
                {(!showMaterialsList || materials.length > 30) && (
                    <div class="EventMaterials__toggle">
                        <button
                            onClick={() => { this.showMaterialsList = !showMaterialsList; }}
                            class={{ info: !showMaterialsList }}
                        >
                            <i
                                class={{
                                    'fas': true,
                                    'fa-eye': !showMaterialsList,
                                    'fa-eye-slash': showMaterialsList,
                                }}
                            />
                            {__(showMaterialsList ? 'hide-materials-details' : 'show-materials-details')}
                        </button>
                    </div>
                )}
                {showMaterialsList && (
                    <div class="EventMaterials__categories">
                        {categories.map((category, categoryIndex) => (
                            <div key={category.id} class="EventMaterials__category">
                                <h4 class="EventMaterials__title">{category.name}</h4>
                                <ul class="EventMaterials__list">
                                    {category.materials.map((material) => (
                                        <li key={material.id} class="EventMaterials__item">
                                            <div class="EventMaterials__item__quantity-first">
                                                {material.pivot.quantity}
                                            </div>
                                            <div class="EventMaterials__item__name">
                                                {material.name}
                                            </div>
                                            {withRentalPrices && (
                                                <div class="EventMaterials__item__price">
                                                    {this.formatAmount(material.rental_price)}
                                                </div>
                                            )}
                                            <div class="EventMaterials__item__quantity">
                                                <i class="fas fa-times" /> {material.pivot.quantity}
                                            </div>
                                            {withRentalPrices && (
                                                <div class="EventMaterials__item__total">
                                                    {this.formatAmount(material.pivot.quantity * material.rental_price)}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {withRentalPrices && (
                                    <div class="EventMaterials__subtotal">
                                        {categoryIndex === categories.length - 1 && (
                                            <button onClick={() => { this.showMaterialsList = false; }}>
                                                <i class="fas fa-eye-slash" /> {__('hide-materials-details')}
                                            </button>
                                        )}
                                        <div class="EventMaterials__subtotal__name">
                                            {__('sub-total')}
                                        </div>
                                        <div class="EventMaterials__subtotal__price">
                                            {this.formatAmount(category.subTotal)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    },
};
