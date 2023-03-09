import './index.scss';
import { defineComponent } from '@vue/composition-api';

// @vue/component
const EventDetailsMainBeneficiary = {
    name: 'EventDetailsMainBeneficiary',
    props: {
        beneficiary: { type: Object, required: true },
    },
    computed: {
        fullAddress() {
            const { company, full_address: contactFullAddress } = this.beneficiary;
            if (!!company && !!company.full_address) {
                return company.full_address;
            }
            return contactFullAddress;
        },

        phone() {
            const { company, phone: contactPhone } = this.beneficiary;
            if (!!company && !!company.phone) {
                return company.phone;
            }
            return contactPhone;
        },

        email() {
            const { company, email: contactEmail } = this.beneficiary;
            if (!!company && !!company.email) {
                return company.email;
            }
            return contactEmail;
        },
    },
    render() {
        const { $t: __, fullAddress, phone, email } = this;

        return (
            <div class="EventDetailsMainBeneficiary">
                {!!fullAddress && (
                    <p class="EventDetailsMainBeneficiary__address">
                        {fullAddress}
                    </p>
                )}
                {!!phone && (
                    <p class="EventDetailsMainBeneficiary__phone">
                        {__('modal.event-details.infos.beneficiary-phone')} <a href={`tel:${phone}`}>{phone}</a>
                    </p>
                )}
                {!!email && (
                    <p class="EventDetailsMainBeneficiary__email">
                        {__('modal.event-details.infos.beneficiary-email')} <a href={`mailto:${email}`}>{email}</a>
                    </p>
                )}
            </div>
        );
    },
};

export default defineComponent(EventDetailsMainBeneficiary);
