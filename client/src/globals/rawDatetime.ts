import RawDateTime from '@/utils/rawDatetime';
import { getLocale } from '@/globals/lang';

import 'dayjs/locale/fr';
import 'dayjs/locale/en-gb';

export const init = (): void => {
    RawDateTime.locale(getLocale());
};

export default RawDateTime;
