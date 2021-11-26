import './index.scss';
import { ref, toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import Datepicker from '@/components/Datepicker';

import type { Render, SetupContext } from '@vue/composition-api';

type LooseDate = string | Date;
type LoosePeriod = { start: LooseDate, end: LooseDate };

type BaseProps = {
    title: string,
    defaultDate?: LooseDate,
};

type Props = BaseProps & (
    | { isRange?: false, onClose?(date?: LooseDate): void }
    | { isRange: true, onClose?(dates?: LoosePeriod): void }
);

// @vue/component
const PromptDate = (props: Props, { emit }: SetupContext): Render => {
    const { title, isRange, defaultDate } = toRefs(props);
    const __ = useI18n();
    const currentDate = ref<LooseDate | Array<LooseDate | undefined> | undefined>(
        isRange?.value === true ? [defaultDate?.value, defaultDate?.value] : defaultDate?.value,
    );

    const handleClose = (): void => {
        emit('close');
    };

    const handleSubmit = (): void => {
        const { value } = currentDate;
        if (!value) {
            return;
        }

        if (typeof value === 'string' || value instanceof Date) {
            emit('close', value);
            return;
        }

        if (Array.isArray(value) && value[0] && value[1]) {
            emit('close', {
                start: value[0],
                end: value[1],
            });
        }
    };

    return () => (
        <div class="PromptDate">
            <div class="PromptDate__header">
                <h2 class="PromptDate__header__title">{title.value}</h2>
                <button type="button" class="PromptDate__header__btn-close" onClick={handleClose}>
                    <i class="fas fa-times" />
                </button>
            </div>
            <div class="PromptDate__main">
                <Datepicker
                    vModel={currentDate.value}
                    isRange={isRange?.value}
                    class="PromptDate__datepicker"
                />
            </div>
            <hr class="PromptDate__separator" />
            <div class="PromptDate__footer">
                <button type="button" onClick={handleSubmit} class="success">
                    <i class="fas fa-check" /> {isRange?.value ? __('choose-period') : __('choose-date')}
                </button>
                <button type="button" onClick={handleClose}>
                    <i class="fas fa-times" /> {__('close')}
                </button>
            </div>
        </div>
    );
};

PromptDate.props = {
    title: { type: String, required: true },
    isRange: { type: Boolean, default: false },
    defaultDate: {
        type: [String, Date],
        default: () => new Date(),
    },
};
PromptDate.emits = ['close'];

export default PromptDate;
