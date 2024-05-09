import createEntityStore from '@/utils/createEntityStore';
import apiTags from '@/stores/api/tags';

export default createEntityStore(
    () => apiTags.all(),
    {
        tagName: (state) => (tagId) => {
            const tag = state.list.find((_tag) => _tag.id === tagId);
            return tag ? tag.name : null;
        },
    },
);
