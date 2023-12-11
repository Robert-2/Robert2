import './index.scss';
import { defineComponent } from '@vue/composition-api';
import NextBookings from './NextBookings';

import type { PropType } from '@vue/composition-api';
import type { BeneficiaryDetails } from '@/stores/api/beneficiaries';

type Props = {
    /* Le bénéficiaire dont on veut afficher les informations. */
    beneficiary: BeneficiaryDetails,
};

/* Contenu de l'onglet "infos" de la page de détails d'un bénéficiaire. */
const BeneficiaryViewInfos = defineComponent({
    name: 'BeneficiaryViewInfos',
    props: {
        beneficiary: {
            type: Object as PropType<Props['beneficiary']>,
            required: true,
        },
    },
    render() {
        const { $t: __, beneficiary } = this;
        const {
            id,
            full_name: fullName,
            reference,
            phone,
            email,
            full_address: address,
            country,
            stats: { borrowings },
            note,
            company,
        } = beneficiary;

        return (
            <div class="BeneficiaryViewInfos">
                <h2 class="BeneficiaryViewInfos__name">
                    {fullName}
                </h2>
                <section class="BeneficiaryViewInfos__main">
                    <div class="BeneficiaryViewInfos__main__contact">
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('reference')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {reference ?? (
                                    <span class="BeneficiaryViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('phone')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {phone ?? (
                                    <span class="BeneficiaryViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('email')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {email ? <a href={`mailto:${email}`}>{email}</a> : (
                                    <span class="BeneficiaryViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('address')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {address ?? (
                                    <span class="BeneficiaryViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('country')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {country?.name ?? (
                                    <span class="BeneficiaryViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                    </div>
                    <div class="BeneficiaryViewInfos__main__extras">
                        {!!note && (
                            <dl class="BeneficiaryViewInfos__info">
                                <dt class="BeneficiaryViewInfos__info__label">
                                    {__('notes')}
                                </dt>
                                <dd class="BeneficiaryViewInfos__info__value">
                                    {note}
                                </dd>
                            </dl>
                        )}
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('page.beneficiary-view.infos.borrowings-count')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                {borrowings > 0 ? borrowings : __('page.beneficiary-view.infos.no-borrowing')}
                            </dd>
                        </dl>
                    </div>
                </section>
                {!!company && (
                    <section class="BeneficiaryViewInfos__company">
                        <dl class="BeneficiaryViewInfos__info">
                            <dt class="BeneficiaryViewInfos__info__label">
                                {__('company')}
                            </dt>
                            <dd class="BeneficiaryViewInfos__info__value">
                                <h4 class="BeneficiaryViewInfos__company__name">
                                    {company.legal_name}
                                </h4>
                                <p class="BeneficiaryViewInfos__company__address">
                                    {company.full_address}
                                    {company.country ? `\n${company.country.name}` : ''}
                                </p>
                                <p>{company.phone}</p>
                                <p>{company.note}</p>
                            </dd>
                        </dl>
                    </section>
                )}
                <section class="BeneficiaryViewInfos__next-bookings">
                    <NextBookings id={id} />
                </section>
            </div>
        );
    },
});

export default BeneficiaryViewInfos;
