import './index.scss';
import { ref, toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import Datepicker from '@/components/Datepicker';

import type { Render, SetupContext } from '@vue/composition-api';

type LooseDate = string | string[] | Date | Date[];

type Props = {
    title: string,
    isRange?: boolean,
    defaultDate?: LooseDate,
    onClose?(params?: { dates: LooseDate }): void,
};

// @vue/component
const PromptDate = (props: Props, { emit }: SetupContext): Render => {
    const { title, isRange, defaultDate } = toRefs(props);
    const currentDate = ref(isRange?.value === true ? [defaultDate?.value, defaultDate?.value] : defaultDate?.value);
    const __ = useI18n();

    const handleClose = (): void => {
        emit('close');
    };

    const handleSubmit = (): void => {
        emit('close', { dates: currentDate.value });
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
