import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { Group } from '@/stores/api/groups';
import Button from '@/themes/default/components/Button';

import type { PropType } from '@vue/composition-api';
import type { GroupDetails } from '@/stores/api/groups';
import type { TechnicianDetails } from '@/stores/api/technicians';

type Props = {
    /** Le technicien dont on veut afficher les détails. */
    technician: TechnicianDetails,
};

/** Onglet des informations d'un technicien. */
const TechnicianViewInfos = defineComponent({
    name: 'TechnicianViewInfos',
    props: {
        technician: {
            type: Object as PropType<Props['technician']>,
            required: true,
        },
    },
    computed: {
        completeName(): string {
            const { full_name: fullName, nickname } = this.technician;
            return !nickname ? fullName : `${fullName} "${nickname}"`;
        },

        email(): string | null {
            const { email, user } = this.technician;
            return email ?? user?.email ?? null;
        },

        userGroup(): GroupDetails | null {
            const { user } = this.technician;
            if (!user) {
                return null;
            }
            return this.$store.getters['groups/get'](user.group);
        },

        isAdmin(): boolean {
            return this.$store.getters['auth/is'](Group.ADMINISTRATION);
        },
    },
    mounted() {
        this.$store.dispatch('groups/fetch');
    },
    render() {
        const { $t: __, completeName, email, userGroup, isAdmin } = this;
        const {
            phone,
            country,
            user,
            note,
            full_address: address,
        } = this.technician;

        return (
            <div class="TechnicianViewInfos">
                <h2 class="TechnicianViewInfos__name">
                    {completeName}
                </h2>
                <section class="TechnicianViewInfos__main">
                    <div class="TechnicianViewInfos__main__contact">
                        <dl class="TechnicianViewInfos__info">
                            <dt class="TechnicianViewInfos__info__label">
                                {__('phone')}
                            </dt>
                            <dd class="TechnicianViewInfos__info__value">
                                {phone ?? (
                                    <span class="TechnicianViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="TechnicianViewInfos__info">
                            <dt class="TechnicianViewInfos__info__label">
                                {__('email')}
                            </dt>
                            <dd class="TechnicianViewInfos__info__value">
                                {email ? <a href={`mailto:${email}`}>{email}</a> : (
                                    <span class="TechnicianViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="TechnicianViewInfos__info">
                            <dt class="TechnicianViewInfos__info__label">
                                {__('address')}
                            </dt>
                            <dd class="TechnicianViewInfos__info__value">
                                {address ?? (
                                    <span class="TechnicianViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                        <dl class="TechnicianViewInfos__info">
                            <dt class="TechnicianViewInfos__info__label">
                                {__('country')}
                            </dt>
                            <dd class="TechnicianViewInfos__info__value">
                                {country?.name ?? (
                                    <span class="TechnicianViewInfos__info__empty">
                                        {__('not-specified')}
                                    </span>
                                )}
                            </dd>
                        </dl>
                    </div>
                    <div class="TechnicianViewInfos__main__extras">
                        {!!user && (
                            <dl class="TechnicianViewInfos__info">
                                <dt class="TechnicianViewInfos__info__label">
                                    {__('page.beneficiary-view.infos.user-account')}
                                </dt>
                                <dd class="TechnicianViewInfos__info__value">
                                    <span class="TechnicianViewInfos__pseudo">
                                        <span class="TechnicianViewInfos__pseudo__at">@</span>
                                        <span class="TechnicianViewInfos__pseudo__value">{user.pseudo}</span>
                                    </span>
                                    {userGroup !== null && (
                                        <span class="TechnicianViewInfos__user-group">({userGroup.name})</span>
                                    )}
                                    {isAdmin && (
                                        <Button
                                            type="transparent"
                                            icon="edit"
                                            to={{ name: 'edit-user', params: { id: user.id } }}
                                            tooltip={__('page.technician-view.infos.modify-associated-user')}
                                            class="TechnicianViewInfos__user-edit-button"
                                        />
                                    )}
                                </dd>
                            </dl>
                        )}
                        {!!note && (
                            <dl class="TechnicianViewInfos__info">
                                <dt class="TechnicianViewInfos__info__label">
                                    {__('notes')}
                                </dt>
                                <dd class="TechnicianViewInfos__info__value">
                                    {note}
                                </dd>
                            </dl>
                        )}
                    </div>
                </section>
            </div>
        );
    },
});

export default TechnicianViewInfos;
