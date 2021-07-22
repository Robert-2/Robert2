import './index.scss';
import { Fragment } from 'vue-fragment';

const TechnicianViewInfos = {
  name: 'TechnicianViewInfos',
  props: {
    technician: { type: Object, required: true },
  },
  render() {
    const { $t: __ } = this;
    const {
      id,
      user_id: userId,
      full_name: fullName,
      nickname,
      reference,
      email,
      phone,
      street,
      postalCode,
      locality,
      country,
      note,
    } = this.technician;

    return (
      <div class="TechnicianViewInfos">
        <div class="TechnicianViewInfos__main">
          <h3 class="TechnicianViewInfos__name">
            {fullName} {nickname && `"${nickname}"`}
          </h3>
          {reference && (
            <h4 class="TechnicianViewInfos__reference">
              <i class="fas fa-hashtag TechnicianViewInfos__icon" />
              {__('ref')} {reference}
            </h4>
          )}
          {email && (
            <p>
              <i class="fas fa-at TechnicianViewInfos__icon" />
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
          {phone && (
            <p>
              <i class="fas fa-phone-alt TechnicianViewInfos__icon" />
              <a href={`phone:${phone}`}>{phone}</a>
            </p>
          )}
          {(street || postalCode || locality) && (
            <Fragment>
              <h4 class="TechnicianViewInfos__section-title">
                <i class="far fa-envelope TechnicianViewInfos__icon" />
                {__('address')}
              </h4>
              <p class="TechnicianViewInfos__address">
                {street}<br />
                {postalCode} {locality}<br />
                {country?.name}
              </p>
            </Fragment>
          )}
          {note && (
            <Fragment>
              <h4 class="TechnicianViewInfos__section-title">
                <i class="far fa-clipboard TechnicianViewInfos__icon" />
                {__('notes')}
              </h4>
              <p class="TechnicianViewInfos__note">{note}</p>
            </Fragment>
          )}
          {userId && (
            <Fragment>
              <h4 class="TechnicianViewInfos__section-title">
                <i class="far fa-user TechnicianViewInfos__icon" />
                {__('user')}
              </h4>
              <p class="TechnicianViewInfos__user">
                <router-link to={`/users/${userId}`}>
                  {__('page-technician-view.modify-associated-user')}
                </router-link>
              </p>
            </Fragment>
          )}
        </div>
        <div class="TechnicianViewInfos__actions">
          <router-link
            v-tooltip={__('action-edit')}
            to={`/technicians/${id}`}
            custom
          >
            {({ navigate }) => (
              <button onClick={navigate} class="info">
                <i class="fas fa-edit" /> {__('action-edit')}
              </button>
            )}
          </router-link>
        </div>
      </div>
    );
  },
};

export default TechnicianViewInfos;
