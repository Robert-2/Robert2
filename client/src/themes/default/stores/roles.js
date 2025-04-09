import createEntityStore from '@/utils/createEntityStore';
import apiRoles from '@/stores/api/roles';

export default createEntityStore(
    () => apiRoles.all(),
);
