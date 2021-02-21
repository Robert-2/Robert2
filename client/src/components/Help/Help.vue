<template>
  <div class="Help" :class="`Help--${modifier}`">
    <div v-if="isLoading" class="Help__loading">
      <i class="fas fa-circle-notch fa-spin" />
      {{ $t('help-loading') }}
    </div>
    <div v-if="!isLoading && error" class="Help__error">
      <i class="fas fa-exclamation-triangle" />
      {{ errorData.message }}
      <p v-if="errorData.code === 500">
        <a class="Help__error-details-button" @click="displayErrorDetails">
          <i class="fas fa-external-link-alt" />
          {{ $t('errors.show-details') }}
        </a>
      </p>
    </div>
    <div v-if="$t(messageText) && !error && !isLoading" class="Help__message">
      {{ $t(messageText) }}
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../themes/default/index';
  @import './Help';
</style>

<script>
import ModalConfig from '@/config/modalConfig';
import ErrorDetails from '@/components/ErrorDetails/ErrorDetails.vue';

export default {
  name: 'Help',
  props: {
    message: { required: true, default: '' },
    error: { type: Error, default: null },
    isLoading: { type: Boolean, default: false },
  },
  data() {
    return {
      errorDetailsModalOpened: false,
    };
  },
  computed: {
    modifier() {
      if (this.isLoading) {
        return 'info';
      }

      if (this.error) {
        return 'error';
      }

      return this.message.type ? this.message.type : 'info';
    },

    messageText() {
      return this.message.text ? this.message.text : this.message;
    },

    networkError() {
      return {
        code: this.error?.response?.status || 0,
        text: this.error?.response?.statusText || this.$t('errors.api-unreachable'),
      };
    },

    errorData() {
      if (!this.error?.response) {
        return {
          code: '',
          message: this.$t('errors.api-unreachable'),
        };
      }

      const { response } = this.error;
      const { status } = response;

      if (status === 400) {
        const { details } = response.data?.error || { details: {} };
        return { code: '', message: this.$t('errors.validation'), details };
      }

      if (status === 409) {
        return { code: '', message: this.$t('errors.already-exists') };
      }

      const defaultError = {
        requested: '',
        code: 500,
        message: 'Unknown error',
        file: '',
        stackTrace: [],
      };

      return response.data?.error || defaultError;
    },
  },
  methods: {
    displayErrorDetails() {
      if (this.errorDetailsModalOpened) {
        return;
      }
      this.errorDetailsModalOpened = true;

      this.$modal.show(
        ErrorDetails,
        { data: this.errorData },
        ModalConfig,
        {
          'before-close': () => {
            this.errorDetailsModalOpened = false;
          },
        },
      );
    },
  },
};
</script>
