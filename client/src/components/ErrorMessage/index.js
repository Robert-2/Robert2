import './index.scss';
import ModalConfig from '@/config/modalConfig';
import Details from './Details/ErrorDetails.vue';

const ErrorMessage = {
  name: 'ErrorMessage',
  props: {
    error: { type: Error, required: true },
  },
  data() {
    return {
      isDetailsModalOpened: false,
    };
  },
  computed: {
    code() {
      const { error } = this;
      if (!error.response) {
        return -1;
      }
      return error.response?.status ?? 500;
    },

    message() {
      const { error } = this;

      if (!error.response) {
        return this.$t('errors.generic', { message: error.message || 'unknown' });
      }
      const { status, data } = error.response;

      if (status === 400) {
        return this.$t('errors.validation');
      }

      if (status === 404) {
        return this.$t('errors.not-found');
      }

      if (status === 409) {
        return this.$t('errors.already-exists');
      }

      return data?.error?.message ?? this.$t('errors.unknown');
    },

    details() {
      const { error } = this;
      if (!error.response) {
        return null;
      }
      const { data } = error.response;
      return data?.error?.debug ?? null;
    },
  },
  methods: {
    handleShowDetails() {
      if (this.isDetailsModalOpened) {
        return;
      }
      this.isDetailsModalOpened = true;
      const { code, message, details } = this;

      this.$modal.show(
        Details,
        { code, message, details },
        ModalConfig,
        {
          'before-close': () => {
            this.isDetailsModalOpened = false;
          },
        },
      );
    },
  },
  render() {
    const { $t: __, code, message, handleShowDetails } = this;

    return (
      <p class="ErrorMessage">
        <span class="ErrorMessage__message">
          <i class="fas fa-exclamation-triangle" />&nbsp;{message}
        </span>
        {code === 500 && (
          <a class="ErrorMessage__show-details" onClick={handleShowDetails}>
            <i class="fas fa-external-link-alt" />&nbsp;{__('errors.show-details')}
          </a>
        )}
      </p>
    );
  },
};

export default ErrorMessage;
