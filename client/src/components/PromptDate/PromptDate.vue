<template>
  <div class="PromptDate">
    <div class="PromptDate__header">
      <h2 class="PromptDate__header__title">
        {{ title }}
      </h2>
      <button class="PromptDate__header__btn-close" @click="$emit('close')">
        <i class="fas fa-times" />
      </button>
    </div>
    <div class="PromptDate__main">
      <Datepicker
        :value="currentDate"
        :language="datepickerLang"
        :format="format || 'dd/MM/yyyy'"
        :placeholder="$t(placeholder)"
        class="PromptDate__datepicker"
        input-class="PromptDate__datepicker__input"
        monday-first
        v-on:input="handleChange"
      />
    </div>
    <hr />
    <div class="PromptDate__footer">
      <button @click="$emit('close', { date: currentDate })" class="success">
        <i class="fas fa-check" />
        {{ $t('choose-date') }}
      </button>
      <button @click="$emit('close')">
        <i class="fas fa-times" />
        {{ $t('close') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './PromptDate';
</style>

<script>
import Datepicker from 'vuejs-datepicker';
import * as lang from 'vuejs-datepicker/src/locale';
import store from '@/store';

export default {
  name: 'PromptDate',
  components: { Datepicker },
  props: {
    title: String,
    defaultDate: [String, Date],
    format: String,
    placeholder: String,
  },
  data() {
    return {
      currentDate: this.defaultDate,
      datepickerLang: lang[store.state.i18n.locale],
    };
  },
  methods: {
    handleChange(newDate) {
      // const newValue = moment(newDate).format('YYYY-MM-DD');
      this.currentDate = newDate;
    },
  },
};
</script>
