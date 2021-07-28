import './index.scss';

export default {
  name: 'EventTechnicianItem',
  props: {
    technician: Object,
  },
  render() {
    const { $t: __, technician } = this;

    return (
      <div class="EventTechnicianItem">
        <router-link
          to={`/technicians/${technician.id}/view#info`}
          title={__('action-view')}
        >
          {technician.full_name}
        </router-link>
      </div>
    );
  },
};
