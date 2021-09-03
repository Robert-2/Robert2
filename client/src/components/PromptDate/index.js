import './index.scss';
import { ref, toRefs } from '@vue/composition-api';
import useI18n from '@/composition/useI18n';
import Datepicker from '@/components/Datepicker';

// @vue/component
const PromptDate = (props, { emit }) => {
    const { title, placeholder, defaultDate } = toRefs(props);
    const currentDate = ref(defaultDate.value);
    const __ = useI18n();

    const handleClose = () => {
        emit('close');
    };

    const handleSubmit = () => {
        emit('close', { date: currentDate.value });
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
                    placeholder={placeholder.value}
                    class="PromptDate__datepicker"
                />
            </div>
            <hr class="PromptDate__separator" />
            <div class="PromptDate__footer">
                <button type="button" onClick={handleSubmit} class="success">
                    <i class="fas fa-check" /> {__('choose-date')}
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
    placeholder: { type: String, default: undefined },
    defaultDate: {
        type: [String, Date],
        default: () => new Date(),
    },
};

export default PromptDate;
