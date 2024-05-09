import './index.scss';
import { defineComponent } from '@vue/composition-api';

import type { PropType } from '@vue/composition-api';
import type { Beneficiary } from '@/stores/api/beneficiaries';

type Props = {
    /**
     * Le bénéficiaire à utiliser comme bénéficiaire
     * principal de l'événement.
     */
    beneficiary: Beneficiary,
};

/**
 * Bénéficiaire principal de l'événement dans l'onglet "Informations"
 * de la modale de détails d'un événement.
 */
const EventDetailsMainBeneficiary = defineComponent({
    name: 'EventDetailsMainBeneficiary',
    props: {
        beneficiary: {
            type: Object as PropType<Props['beneficiary']>,
            required: true,
        },
    },
    computed: {
        fullAddress(): string | null {
            const { company, full_address: contactFullAddress } = this.beneficiary;
            if (!!company && !!company.full_address) {
                return company.full_address;
            }
            return contactFullAddress;
        },

        phone(): string | null {
            const { company, phone: contactPhone } = this.beneficiary;
            if (!!company && !!company.phone) {
                return company.phone;
            }
            return contactPhone;
        },

        email(): string | null {
            return this.beneficiary.email;
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
});

export default EventDetailsMainBeneficiary;
