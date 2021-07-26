import './index.scss';
import Datepicker from '@/components/Datepicker';

export default {
  name: 'PromptDate',
  props: {
    title: String,
    defaultDate: [String, Date],
    placeholder: String,
  },
  data() {
    return {
      currentDate: this.defaultDate,
    };
  },
  methods: {
    handleSubmit() {
      this.$emit('close', { date: this.currentDate });
    },

    handleClose() {
      this.$emit('close');
    },
  },
  render() {
    const { $props, $t: __, handleSubmit, handleClose } = this;
    const { title, placeholder } = $props;

    return (
      <div class="PromptDate">
        <div class="PromptDate__header">
          <h2 class="PromptDate__header__title">
            {title}
          </h2>
          <button class="PromptDate__header__btn-close" onClick={handleClose}>
            <i class="fas fa-times" />
          </button>
        </div>
        <div class="PromptDate__main">
          <Datepicker
            v-model={this.currentDate}
            placeholder={placeholder}
            class="PromptDate__datepicker"
          />
        </div>
        <hr class="PromptDate__separator" />
        <div class="PromptDate__footer">
          <button onClick={handleSubmit} class="success">
            <i class="fas fa-check" /> {__('choose-date')}
          </button>
          <button onClick={handleClose}>
            <i class="fas fa-times" /> {__('close')}
          </button>
        </div>
      </div>
    );
  },
};
