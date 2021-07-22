import './index.scss';
import moment from 'moment';
import Datepicker from 'vue2-datepicker';
import * as langs from './locale';

export default {
  name: 'Datepicker',
  props: {
    value: [Date, Array],
    withTime: { type: Boolean, default: false },
    isRange: { type: Boolean, default: false },
    isClearable: { type: Boolean, default: false },
    displayFormat: { type: String, default: 'LL' },
    placeholder: String,
  },
  data() {
    const { locale } = this.$store.state.i18n;

    return {
      lang: langs[locale] || undefined,
      formatter: {
        stringify: (date, format) => (date ? moment(date).format(format) : ''),
      },
    };
  },
  methods: {
    handleInput(newValue) {
      this.$emit('input', newValue);
    },
  },
  render() {
    const { $props, lang, formatter, handleInput } = this;
    const { value, withTime, isRange, isClearable, displayFormat, placeholder } = $props;

    return (
      <Datepicker
        value={value}
        type={withTime ? 'datetime' : 'date'}
        range={isRange}
        lang={lang}
        onInput={handleInput}
        minuteStep={15}
        showSecond={false}
        showTimeHeader={withTime}
        clearable={isClearable}
        placeholder={placeholder}
        formatter={formatter}
        format={withTime ? `${displayFormat} HH:mm` : displayFormat}
      />
    );
  },
};
