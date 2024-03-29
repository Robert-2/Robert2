import './index.scss';
import Fragment from '@/components/Fragment';
import formatAddress from '@/utils/formatAddress';

// @vue/component
export default {
    name: 'TechnicianViewInfos',
    props: {
        technician: { type: Object, required: true },
    },
    computed: {
        completeName() {
            const { full_name: fullName, nickname } = this.technician;
            if (!nickname) {
                return fullName;
            }
            return `${fullName} "${nickname}"`;
        },
    },
    render() {
        const { $t: __, completeName } = this;
        const {
            user_id: userId,
            reference,
            email,
            phone,
            street,
            postal_code: postalCode,
            locality,
            country,
            note,
        } = this.technician;

        return (
            <div class="TechnicianViewInfos">
                <h3 class="TechnicianViewInfos__name">
                    {completeName}
                </h3>
                {!!reference && (
                    <h4 key="ref" class="TechnicianViewInfos__reference">
                        {__('ref-ref', { reference })}
                    </h4>
                )}
                {!!email && (
                    <p key="email" lass="TechnicianViewInfos__email">
                        <a href={`mailto:${email}`}>{email}</a>
                    </p>
                )}
                {!!phone && (
                    <p key="phone" class="TechnicianViewInfos__phone">
                        <a href={`tel:${phone}`}>{phone}</a>
                    </p>
                )}
                {(!!street || !!postalCode || !!locality || !!country) && (
                    <Fragment key="address">
                        <h4 class="TechnicianViewInfos__section-title TechnicianViewInfos__section-title--address">
                            {__('address')}
                        </h4>
                        <p class="TechnicianViewInfos__address">
                            {formatAddress(street, postalCode, locality, country)}
                        </p>
                    </Fragment>
                )}
                {!!note && (
                    <Fragment key="notes">
                        <h4 class="TechnicianViewInfos__section-title TechnicianViewInfos__section-title--notes">
                            {__('notes')}
                        </h4>
                        <p class="TechnicianViewInfos__note">{note}</p>
                    </Fragment>
                )}
                {!!userId && (
                    <Fragment key="user">
                        <h4 class="TechnicianViewInfos__section-title TechnicianViewInfos__section-title--user">
                            {__('user')}
                        </h4>
                        <p class="TechnicianViewInfos__user">
                            <router-link to={`/users/${userId}`}>
                                {__('page.technician-view.infos.modify-associated-user')}
                            </router-link>
                        </p>
                    </Fragment>
                )}
            </div>
        );
    },
};
