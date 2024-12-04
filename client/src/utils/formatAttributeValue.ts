import { AttributeType } from '@/stores/api/attributes';

import type { I18nTranslate } from 'vuex-i18n';
import type { AttributeWithValue } from '@/stores/api/attributes';

/**
 * Formate la valeur d'une caractéristique spéciale selon son type.
 *
 * @param __ - La fonction de traduction.
 * @param attribute - La caractéristique spéciale dont on veut afficher la valeur.
 *
 * @returns La valeur de la caractéristique spéciale.
 */
const formatAttributeValue = (__: I18nTranslate, attribute: AttributeWithValue): string | null => {
    const { type, value } = attribute;

    switch (type) {
        case AttributeType.STRING:
        case AttributeType.TEXT: {
            return value;
        }
        case AttributeType.INTEGER:
        case AttributeType.FLOAT: {
            return [value, attribute.unit].join('\u00A0');
        }
        case AttributeType.DATE: {
            return value?.toReadable() ?? null;
        }
        case AttributeType.BOOLEAN: {
            return value ? __('yes') : __('no');
        }
        default: {
            return null;
        }
    }
};

export default formatAttributeValue;
