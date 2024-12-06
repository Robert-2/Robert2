import getUnsyncedData from './getUnsyncedData';

import type { UnsyncedDataValue } from './getUnsyncedData';
import type { SourceMaterial } from '../_types';

const isMaterialResyncable = (material: SourceMaterial, withBilling: boolean): boolean => {
    if (material.is_deleted) {
        return false;
    }

    const unsyncedData = getUnsyncedData(material, withBilling);
    return Object.values(unsyncedData).some(
        (datum: UnsyncedDataValue<unknown>) => (
            datum.isUnsynced && datum.isResyncable
        ),
    );
};

export default isMaterialResyncable;
