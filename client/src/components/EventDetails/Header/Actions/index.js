import './index.scss';
import Config from '@/config/globalConfig';
import ModalConfig from '@/config/modalConfig';
import Alert from '@/components/Alert';
import Dropdown from '@/components/Dropdown';
import DuplicateEvent from '@/components/DuplicateEvent';

export default {
  name: 'CalendarEventDetailsHeaderActions',
  props: {
    event: { type: Object, required: true },
  },
  data() {
    return {
      isConfirming: false,
      isArchiving: false,
      isDeleting: false,
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

    isEditable() {
      const { isPast, isConfirmed, isInventoryDone } = this.event;
      return !isPast || !(isInventoryDone || isConfirmed);
    },

    isRemovable() {
      const { isConfirmed, isInventoryDone } = this.event;
      return !(isConfirmed || isInventoryDone);
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

      const { id } = this.event;

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

      const { id } = this.event;

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

    async handleDelete() {
      const { isVisitor, isRemovable, isDeleting } = this;
      if (isVisitor || !isRemovable || isDeleting) {
        return;
      }

      const result = await Alert.ConfirmDelete(this.$t, 'calendar');
      if (!result.value) {
        return;
      }
      this.isDeleting = true;

      const { id } = this.event;

      try {
        const url = `events/${id}`;
        await this.$http.delete(url);
        this.$emit('deleted', id);
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.isDeleting = false;
      }
    },

    askDuplicate() {
      const { event } = this;

      const modalConfig = {
        ...ModalConfig,
        name: 'duplicateEventStartDateModal',
        width: 600,
        draggable: true,
        clickToClose: false,
      };

      this.$modal.show(DuplicateEvent, { event }, modalConfig);
    },
  },
  render() {
    const {
      $t: __,
      isVisitor,
      isEditable,
      isConfirmable,
      isPrintable,
      isRemovable,
      eventSummaryPdfUrl,
      isArchiving,
      isConfirming,
      isDeleting,
      toggleConfirmed,
      toggleArchived,
      handleDelete,
      askDuplicate,
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
        {isEditable && (
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
        <Dropdown>
          <template slot="items">
            {!isPast && (
              <button
                class={{ info: isConfirmed, success: !isConfirmed }}
                disabled={isConfirmable}
                onClick={toggleConfirmed}
              >
                {!isConfirming && !isConfirmed && <i class="fas fa-check" />}
                {!isConfirming && isConfirmed && <i class="fas fa-hourglass-half" />}
                {isConfirming && <i class="fas fa-circle-notch fa-spin" />}
                {' '}{isConfirmed ? __('unconfirm-event') : __('confirm-event')}
              </button>
            )}
            {isPast && isInventoryDone && (
              <button class={{ info: !isArchived }} onClick={toggleArchived}>
                {!isArchiving && <i class="fas fa-archive" />}
                {isArchiving && <i class="fas fa-circle-notch fa-spin" />}
                {' '}{isArchived ? __('unarchive-event') : __('archive-event')}
              </button>
            )}
            <button class="warning" onClick={askDuplicate}>
              <i class="fas fa-copy" /> {__('duplicate-event')}
            </button>
            {isRemovable && (
              <button class="danger" onClick={handleDelete}>
                {!isDeleting && <i class="fas fa-trash" />}
                {isDeleting && <i class="fas fa-circle-notch fa-spin" />}
                {' '}{__('delete-event')}
              </button>
            )}
          </template>
        </Dropdown>
      </div>
    );
  },
};
