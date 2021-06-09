import './index.scss';
import FormField from '@/components/FormField';
import Alert from '@/components/Alert';

export default {
  name: 'MaterialUnitStateItem',
  components: { FormField },
  props: {
    id: Number,
    name: String,
    isNew: Boolean,
  },
  data() {
    return {
      isEditing: false,
      editValue: this.name,
    };
  },
  methods: {
    handleClickEdit() {
      this.isEditing = true;
      this.editValue = this.name;
    },

    async handleSave() {
      const { id, editValue } = this;
      if (editValue.length < 2) {
        return;
      }

      this.$emit('saving');

      try {
        if (id) {
          await this.$http.put(`unit-states/${id}`, { name: editValue });
        } else {
          await this.$http.post('unit-states', { name: editValue });
        }
        this.isEditing = false;
        this.$emit('saved');
      } catch (error) {
        this.$emit('error', error);
      }
    },

    handleCancelEdit() {
      this.isEditing = false;
      this.$emit('cancel');
    },

    async handleDelete() {
      const { id } = this;
      const result = await Alert.ConfirmDelete(this.$t, 'settings.material-units', false);
      if (!id || !result.value) {
        return;
      }

      this.$emit('saving');

      try {
        await this.$http.delete(`unit-states/${id}`);
        this.$emit('saved');
      } catch (error) {
        this.$emit('error', error);
      }
    },
  },
  render() {
    const {
      name,
      isNew = false,
      isEditing,
      editValue,
      handleClickEdit,
      handleSave,
      handleCancelEdit,
      handleDelete,
    } = this;

    return (
      <tr class="MaterialUnitStateItem">
        <td class="MaterialUnitStateItem__icon">
          <i class="fas fa-crosshairs" />
        </td>
        <td class="MaterialUnitStateItem__name">
          {!isEditing && name}
          {(isEditing || isNew) && (
            <FormField
              type="text"
              name="unitState"
              value={editValue}
              onChange={(newValue) => { this.editValue = newValue; }}
            />
          )}
        </td>
        {(!isEditing && !isNew) && (
          <td class="MaterialUnitStateItem__actions">
            <button class="info" onClick={handleClickEdit}>
              <i class="fas fa-pen" />
            </button>
            <button class="danger" onClick={handleDelete}>
              <i class="fas fa-trash" />
            </button>
          </td>
        )}
        {(isEditing || isNew) && (
          <td class="MaterialUnitStateItem__actions">
            <button class="success" onClick={handleSave}>
              <i class="fas fa-check" />
            </button>
            <button onClick={handleCancelEdit}>
              <i class="fas fa-ban" />
            </button>
          </td>
        )}
      </tr>
    );
  },
};
