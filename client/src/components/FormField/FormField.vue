<template>
  <div
    class="FormField"
    :class="addon ? 'FormField--with-addon' : ''"
  >
    <label v-if="label" class="FormField__label">
      {{ $t(label) }}
      <span v-if="required" class="FormField__label__required">*</span>
    </label>
    <div
      v-if="['text', 'email', 'tel', 'password', 'number'].includes(type)"
      class="FormField__input-wrapper"
    >
      <input
        :type="type"
        :step="type === 'number' ? (step || .01) : null"
        :min="type === 'number' ? (min || null) : null"
        :max="type === 'number' ? (max || null) : null"
        :name="name"
        :autocomplete="type === 'password' ? 'new-password' : 'off'"
        :disabled="disabled"
        :placeholder="$t(placeholder)"
        class="FormField__input"
        :value="value"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
      ><div v-if="addon" class="FormField__addon">
        {{ addon }}
      </div>
    </div>
    <select
      v-if="type === 'select'"
      :name="name"
      :value="value"
      :disabled="disabled"
      @input="$emit('input', $event.target.value)"
      @change="$emit('change', $event.target.value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ $t(option.label) }}
      </option>
    </select>
    <textarea
      v-if="type === 'textarea'"
      :name="name"
      :value="value"
      :disabled="disabled"
      :placeholder="$t(placeholder)"
      class="FormField__textarea"
      @input="$emit('input', $event.target.value)"
    />
    <Datepicker
      v-if="type === 'date'"
      :value="value"
      :language="datepickerLang"
      :format="datepickerOptions.format"
      :disabled-dates="datepickerOptions.disabled"
      :placeholder="$t(placeholder)"
      class="FormField__datepicker"
      input-class="FormField__datepicker__input"
      monday-first
      v-on:input="handleDatepickerChange"
    />
    <div v-if="type === 'switch'" class="FormField__switch">
      <SwitchToggle
        :value="value"
        :locked="disabled"
        :lockedReason="disabledReason"
        @input="handleSwitchChange"
      />
    </div>
    <div v-if="errors" class="FormField__error">
      <span class="FormField__error__text">{{ errors[0] }}</span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './FormField';
</style>

<script>
import Datepicker from 'vuejs-datepicker';
import * as lang from 'vuejs-datepicker/src/locale';
import store from '@/store';
import SwitchToggle from '@/components/SwitchToggle/SwitchToggle.vue';

const ALLOWED_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'select',
  'textarea',
  'date',
  'switch',
];

export default {
  name: 'FormField',
  components: { Datepicker, SwitchToggle },
  props: {
    label: String,
    name: String,
    type: {
      validator: (value) => ALLOWED_TYPES.includes(value),
      default: 'text',
    },
    required: Boolean,
    disabled: Boolean,
    disabledReason: String,
    placeholder: String,
    value: [String, Number, Date, Boolean],
    step: Number,
    min: Number,
    max: Number,
    addon: String,
    options: Array,
    errors: Array,
    datepickerOptions: Object,
  },
  data() {
    return { datepickerLang: lang[store.state.i18n.locale] };
  },
  methods: {
    handleDatepickerChange(newDate) {
      this.$emit('input', newDate);
      this.$emit('change', { field: this.name, newDate });
    },

    handleSwitchChange(newValue) {
      this.$emit('input', newValue);
      this.$emit('change', { field: this.name, newValue });
    },
  },
};
</script>
