import Step1 from './1';
import Step2 from './2';
import Step3 from './3';
import Step4 from './4';
import Step5 from './5';
import Step6 from './6';

import type { RawComponent } from 'vue';
import type { Step } from '@/themes/default/components/Stepper';

export default new Map<Step['id'], RawComponent>([
    [1, Step1],
    [2, Step2],
    [3, Step3],
    [4, Step4],
    [5, Step5],
    [6, Step6],
]);
