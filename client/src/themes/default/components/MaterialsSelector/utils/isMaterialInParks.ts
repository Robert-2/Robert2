import type { Material } from '@/stores/api/materials';
import type { Park } from '@/stores/api/parks';

/**
 * Vérifie si un matériel (ou l'une de / toute ses unités) a pour parc l'un
 * de ceux de la liste passée sous forme d'identifiants.
 *
 * @param material - Le matériel dont on veut savoir s'il a pour parc l'un des ceux spécifiés.
 * @param parks - La listes des identifiants des parcs.
 *
 * @returns `true` si le matériel a pour parc l'un de ceux spécifiés, `false` sinon.
 */
const isMaterialInParks = (material: Material, parks: Array<Park['id']>): boolean => (
    parks.includes(material.park_id)
);

export default isMaterialInParks;
