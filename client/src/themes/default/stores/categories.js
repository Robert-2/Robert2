import createEntityStore from '@/utils/createEntityStore';
import apiCategories from '@/stores/api/categories';

export default createEntityStore(
    () => apiCategories.all(),
    {
        category: (state) => (categoryId) => (
            state.list.find((_category) => _category.id === categoryId)
        ),

        categoryName: (state) => (categoryId) => (
            state.list.find((_category) => _category.id === categoryId)?.name ?? null
        ),

        subCategoryName: (state) => (subCategoryId) => {
            let name = null;
            state.list.forEach((category) => {
                if (!name) {
                    const subCategory = category.sub_categories.find(
                        (_subCategory) => _subCategory.id === subCategoryId,
                    );
                    name = subCategory ? subCategory.name : null;
                }
            });
            return name;
        },
    },
);
