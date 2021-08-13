import './index.scss';

const ReturnInventoryItem = {
    name: 'ReturnInventoryItem',
    props: {
        data: Object,
    },
    render() {
        const { $t: __, data } = this;
        const {
            id,
            name,
            out,
            returned,
            missing,
            broken,
        } = data;

        return (
      <li class="ReturnInventoryItem">
        <div class="ReturnInventoryItem__name">
          <router-link to={`/materials/${id}/view`}>{name}</router-link>
        </div>
        <div class="ReturnInventoryItem__missing">
          {missing > 0 && __(
              'page-events.not-returned-material-count',
              { out, returned, missing },
              returned,
          )}
        </div>
        <div class="ReturnInventoryItem__broken">
          {broken > 0 && __(
              'page-events.broken-material-count',
              { broken },
              broken,
          )}
        </div>
      </li>
        );
    },
};

export default ReturnInventoryItem;
