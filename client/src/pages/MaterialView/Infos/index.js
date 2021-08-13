import moment from 'moment';
import Config from '@/config/globalConfig';
import formatAmount from '@/utils/formatAmount';
import MaterialTags from '@/components/MaterialTags/MaterialTags.vue';
import Attributes from './Attributes/Attributes.vue';

export default {
    name: 'MaterialViewInfos',
    components: {
        Attributes,
        MaterialTags,
    },
    props: {
        material: { required: true, type: Object },
    },
    data() {
        return {
            showBilling: Config.billingMode !== 'none',
        };
    },
    computed: {
        createDate() {
            const { created_at: createdAt } = this.material;
            return createdAt ? moment(createdAt).format('L') : null;
        },

        updateDate() {
            const { updated_at: updatedAt } = this.material;
            return updatedAt ? moment(updatedAt).format('L') : null;
        },

        categoryName() {
            const { category_id: categoryId } = this.material;
            const categoryNameGetter = this.$store.getters['categories/categoryName'];
            return categoryNameGetter(categoryId);
        },

        subCategoryName() {
            const { sub_category_id: subCategoryId } = this.material;
            const subCategoryNameGetter = this.$store.getters['categories/subCategoryName'];
            return subCategoryNameGetter(subCategoryId);
        },

        rentalPrice() {
            const { rental_price: rentalPrice } = this.material;
            return rentalPrice ? formatAmount(rentalPrice) : null;
        },

        replacementPrice() {
            const { replacement_price: replacementPrice } = this.material;
            return replacementPrice ? formatAmount(replacementPrice) : null;
        },

        queryStringCategory() {
            return `category=${this.material.category_id}`;
        },

        queryStringSubCategory() {
            return `category=${this.material.category_id}&subCategory=${this.material.sub_category_id}`;
        },

        pictureUrl() {
            const { baseUrl } = Config;
            const { id, picture } = this.material;
            return picture ? `${baseUrl}/materials/${id}/picture` : null;
        },
    },
    mounted() {
        this.$store.commit('setPageSubTitle', this.material.name);
    },
};
