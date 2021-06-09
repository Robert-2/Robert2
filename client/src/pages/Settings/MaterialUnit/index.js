import './index.scss';
import Help from '@/components/Help/Help.vue';
import StateItem from './StateItem';

export default {
  name: 'MaterialUnitSettings',
  components: { Help, StateItem },
  data() {
    return {
      help: 'page-settings.material-units.help',
      error: null,
      isLoading: false,
      unitStates: [],
      startNew: false,
    };
  },
  mounted() {
    this.fetchUnitStates();
  },
  methods: {
    async fetchUnitStates() {
      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await this.$http.get('unit-states');
        this.unitStates = data;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },

    handleSaving() {
      this.isLoading = true;
      this.error = null;
    },

    handleSaved() {
      this.isLoading = false;
      this.startNew = false;
      this.fetchUnitStates();
      this.$store.dispatch('unitStates/refresh');
    },

    handleCancel() {
      this.startNew = false;
    },

    handleError(error) {
      this.isLoading = false;
      this.error = error;
    },
  },
  render() {
    const {
      $t: __,
      unitStates,
      help,
      error,
      isLoading,
      startNew,
      handleSaving,
      handleSaved,
      handleCancel,
      handleError,
    } = this;

    return (
      <div class="MaterialUnitSettings">
        <div class="MaterialUnitSettings__content">
          <h3 class="MaterialUnitSettings__title">
            {__('page-settings.material-units.states')}
          </h3>
          <table class="MaterialUnitSettings__states">
            <tbody>
              {unitStates.map(({ id, name }) => (
                <StateItem
                  id={id}
                  name={name}
                  onSaving={handleSaving}
                  onSaved={handleSaved}
                  onCancel={handleCancel}
                  onError={handleError}
                />
              ))}
              {startNew && (
                <StateItem
                  id={null}
                  name=""
                  isNew
                  onSaving={handleSaving}
                  onSaved={handleSaved}
                  onCancel={handleCancel}
                  onError={handleError}
                />
              )}
            </tbody>
          </table>
          <button class="info" onClick={() => { this.startNew = true; }}>
            <i class="fas fa-plus" />{' '}
            {__('page-settings.material-units.add')}
          </button>
        </div>
        <div class="MaterialUnitSettings__help">
          <Help
            message={help}
            error={error}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  },
};
