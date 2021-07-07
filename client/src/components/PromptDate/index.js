import './index.scss';
import moment from 'moment';
import Datepicker from 'vuejs-datepicker';
import * as lang from 'vuejs-datepicker/src/locale';

export default {
  name: 'PromptDate',
  props: {
    title: String,
    defaultDate: [String, Date],
    format: String,
    placeholder: String,
  },
  data() {
    const { locale } = this.$store.state.i18n;

    return {
      currentDate: this.defaultDate,
      datepickerLang: lang[locale],
    };
  },
  methods: {
    formatDate(date) {
      return this.format || moment(date).format('LL');
    },

    handleChange(newDate) {
      this.currentDate = newDate;
    },

    handleSubmit() {
      this.$emit('close', { date: this.currentDate });
    },

    handleClose() {
      this.$emit('close');
    },
  },
  render() {
    const {
      $t: __,
      title,
      currentDate,
      datepickerLang,
      formatDate,
      placeholder,
      handleChange,
      handleSubmit,
      handleClose,
    } = this;

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
            value={currentDate}
            language={datepickerLang}
            format={formatDate}
            placeholder={__(placeholder)}
            class="PromptDate__datepicker"
            input-class="PromptDate__datepicker__input"
            monday-first
            onInput={handleChange}
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
