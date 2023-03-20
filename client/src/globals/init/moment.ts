import moment from 'moment';
import { getLocale } from '@/globals/lang';

import 'moment/locale/fr';
import 'moment/locale/en-gb';

export default (): void => {
    moment.locale(getLocale());
};
