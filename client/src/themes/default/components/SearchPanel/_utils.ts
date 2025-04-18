/* eslint-disable import/prefer-default-export */

import Period from '@/utils/period';
import isEqualWith from 'lodash/isEqualWith';

export const hasChanged = (a: unknown, b: unknown): boolean => (
    !isEqualWith(a, b, (_a: unknown, _b: unknown) => {
        if (_a instanceof Period && _b instanceof Period) {
            return _a.isSame(_b);
        }
        return undefined;
    })
);
