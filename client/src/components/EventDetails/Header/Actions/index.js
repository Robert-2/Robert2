import './index.scss';
import Config from '@/config/globalConfig';
import Dropdown from '@/components/Dropdown';

export default {
  name: 'CalendarEventDetailsHeaderActions',
  props: {
    event: { type: Object, required: true },
  },
  data() {
    return {
      isConfirming: false,
      isArchiving: false,
    };
  },
  computed: {
    isPrintable() {
      return (
        this.event.materials
        && this.event.materials.length > 0
        && this.event.beneficiaries
        && this.event.beneficiaries.length > 0
      );
    },

    isVisitor() {
      return this.$store.getters['auth/is']('visitor');
    },

    isModifiable() {
      const { isPast, isConfirmed, isInventoryDone } = this.event;

      return !((isPast && isInventoryDone) || (isPast && isConfirmed));
    },

    isConfirmable() {
      return this.event.materials?.length === 0;
    },

    eventSummaryPdfUrl() {
      const { baseUrl } = Config;
      const { id } = this.event || { id: null };
      return `${baseUrl}/events/${id}/pdf`;
    },
  },
  methods: {
    toggleConfirmed() {
      this.setEventConfirmation(!this.event.isConfirmed);
    },

    async setEventConfirmation(isConfirmed) {
      if (this.isConfirming) {
        return;
      }
      this.isConfirming = true;

      const { id } = this.$props.event;

      try {
        const url = `events/${id}`;
        const { data } = await this.$http.put(url, { id, is_confirmed: isConfirmed });
        this.$emit('saved', data);
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.isConfirming = false;
      }
    },

    toggleArchived() {
      this.setEventArchived(!this.event.isArchived);
    },

    async setEventArchived(isArchived) {
      if (this.isArchiving) {
        return;
      }
      this.isArchiving = true;

      const { id } = this.$props.event;

      try {
        const url = `events/${id}`;
        const { data } = await this.$http.put(url, { id, is_archived: isArchived });
        this.$emit('saved', data);
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.isArchiving = false;
      }
    },
  },
  render() {
    const {
      $t: __,
      isVisitor,
      isModifiable,
      isConfirmable,
      isPrintable,
      eventSummaryPdfUrl,
      isArchiving,
      isConfirming,
      toggleConfirmed,
      toggleArchived,
    } = this;

    if (isVisitor) {
      return isPrintable ? (
        <a href={eventSummaryPdfUrl} class="button outline" target="_blank">
          <i class="fas fa-print" /> {__('print')}
        </a>
      ) : null;
    }

    const {
      id,
      isPast,
      isConfirmed,
      isInventoryDone,
      isArchived,
    } = this.event;

    return (
      <div class="EventDetailsHeaderActions">
        {isPrintable && (
          <a href={eventSummaryPdfUrl} class="button outline" target="_blank">
            <i class="fas fa-print" /> {__('print')}
          </a>
        )}
        {isModifiable && (
          <router-link to={`/events/${id}`} custom>
            {({ navigate }) => (
              <button class="info" onClick={navigate}>
                <i class="fas fa-edit" /> {__('action-edit')}
              </button>
            )}
          </router-link>
        )}
        {isPast && !isArchived && (
          <router-link to={`/event-return/${id}`} custom>
            {({ navigate }) => (
              <button class="info" onClick={navigate}>
                <i class="fas fa-tasks" /> {__('return-inventory')}
              </button>
            )}
          </router-link>
        )}
        {(!isPast || (isPast && isInventoryDone)) && (
          <Dropdown>
            <template slot="items">
              {!isPast && (
                <button
                  class={{ warning: isConfirmed, success: !isConfirmed }}
                  disabled={isConfirmable}
                  onClick={toggleConfirmed}
                >
                  {!isConfirming && isConfirmed && <i class="fas fa-check" />}
                  {!isConfirming && !isConfirmed && <i class="fas fa-hourglass-half" />}
                  {isConfirming && <i class="fas fa-circle-notch fa-spin" />}
                  {' '}{isConfirmed ? __('unconfirm-event') : __('confirm-event')}
                </button>
              )}
              {isPast && isInventoryDone && (
                <button class={{ info: !isArchived }} onClick={toggleArchived}>
                  {!isArchiving && <i class="fas fa-box" />}
                  {isArchiving && <i class="fas fa-circle-notch fa-spin" />}
                  {' '}{isArchived ? __('unarchive-event') : __('archive-event')}
                </button>
              )}
            </template>
          </Dropdown>
        )}
      </div>
    );
  },
};
