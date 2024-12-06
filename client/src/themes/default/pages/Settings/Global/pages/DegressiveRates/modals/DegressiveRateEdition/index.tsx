import './index.scss';
import axios from 'axios';
import omit from 'lodash/omit';
import uniqueId from 'lodash/uniqueId';
import apiDegressiveRates from '@/stores/api/degressive-rates';
import { ApiErrorCode } from '@/stores/api/@codes';
import { defineComponent } from '@vue/composition-api';
import Fragment from '@/components/Fragment';
import FormField from '@/themes/default/components/FormField';
import Input from '@/themes/default/components/Input';
import EmptyMessage from '@/themes/default/components/EmptyMessage';
import { ClientTable, Variant as TableVariant } from '@/themes/default/components/Table';
import SwitchToggle from '@/themes/default/components/SwitchToggle';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';

import type { CreateElement } from 'vue';
import type { Simplify } from 'type-fest';
import type { PropType } from '@vue/composition-api';
import type { Columns } from '@/themes/default/components/Table/Client';
import type {
    DegressiveRate,
    DegressiveRateTier,
    DegressiveRateEdit as DegressiveRateEditCore,
    DegressiveRateTierEdit as DegressiveRateTierEditCore,
} from '@/stores/api/degressive-rates';

type DegressiveRateTierEdit = DegressiveRateTierEditCore & { key: string };

type DegressiveRateEdit = Simplify<(
    & Omit<DegressiveRateEditCore, 'tiers'>
    & { tiers: DegressiveRateTierEdit[] }
)>;

type Props = {
    /** Le tarif dégressif à éditer. */
    degressiveRate?: DegressiveRate,
};

type Data = {
    data: DegressiveRateEdit,
    isSaving: boolean,
    validationErrors: Record<string, any> | undefined,
};

const getTierDefaults = (savedData?: DegressiveRateTier): DegressiveRateTierEdit => ({
    key: uniqueId(),
    from_day: savedData?.from_day ?? null,
    is_rate: savedData?.is_rate ?? true,
    value: savedData?.value.toString() ?? null,
});

const getDefaults = (savedData?: DegressiveRate): DegressiveRateEdit => ({
    name: savedData?.name ?? null,
    tiers: (savedData?.tiers ?? []).map((tier: DegressiveRateTier) => (
        getTierDefaults(tier)
    )),
});

/** Modale d'edition d'un tarif dégressif. */
const ModalDegressiveRateEdition = defineComponent({
    name: 'ModalDegressiveRateEdition',
    modal: {
        width: 800,
        clickToClose: false,
    },
    props: {
        degressiveRate: {
            type: Object as PropType<Props['degressiveRate']>,
            default: undefined,
        },
    },
    emits: ['close'],
    data(): Data {
        return {
            data: getDefaults(this.degressiveRate),
            isSaving: false,
            validationErrors: undefined,
        };
    },
    computed: {
        title(): string {
            const { __, degressiveRate } = this;

            return degressiveRate !== undefined
                ? __('modal-title.edit', { name: degressiveRate.name })
                : __('modal-title.new');
        },

        tiersColumns(): Columns<DegressiveRateTierEdit> {
            const { __, data, handleRemoveTier } = this;
            const validationErrors = this.validationErrors?.tiers ?? [];

            return [
                {
                    key: 'from_day',
                    title: __('fields.tiers.fields.from_day'),
                    class: 'ModalDegressiveRateEdition__tiers__item__name',
                    render: (h: CreateElement, { key }: DegressiveRateTierEdit) => {
                        // - Récupère le palier depuis le state sans quoi il n'est pas réactif.
                        const tier = data.tiers.find(
                            (_tier: DegressiveRateTierEdit) => _tier.key === key,
                        );
                        if (!tier) {
                            return null;
                        }
                        const index = data.tiers.indexOf(tier);

                        return (
                            <Input
                                min={0}
                                type="number"
                                v-model={tier.from_day}
                                invalid={!!validationErrors?.[index]?.from_day}
                            />
                        );
                    },
                },
                {
                    key: 'is_rate',
                    title: '',
                    class: 'ModalDegressiveRateEdition__tiers__item__is-rate',
                    render: (h: CreateElement, { key }: DegressiveRateTierEdit) => {
                        // - Récupère le palier depuis le state sans quoi il n'est pas réactif.
                        const tier = data.tiers.find(
                            (_tier: DegressiveRateTierEdit) => _tier.key === key,
                        );
                        if (!tier) {
                            return null;
                        }
                        const index = data.tiers.indexOf(tier);

                        return (
                            <SwitchToggle
                                v-model={tier.is_rate}
                                options={[
                                    { label: __('fields.tiers.fields.is-rate.options.rate'), value: true },
                                    { label: __('fields.tiers.fields.is-rate.options.fixed'), value: false },
                                ]}
                                invalid={!!validationErrors?.[index]?.is_rate}
                            />
                        );
                    },
                },
                {
                    key: 'value',
                    title: __('fields.tiers.fields.value.label'),
                    class: 'ModalDegressiveRateEdition__tiers__item__value',
                    render: (h: CreateElement, { key }: DegressiveRateTierEdit) => {
                        // - Récupère le palier depuis le state sans quoi il n'est pas réactif.
                        const tier = data.tiers.find(
                            (_tier: DegressiveRateTierEdit) => _tier.key === key,
                        );
                        if (!tier) {
                            return null;
                        }
                        const index = data.tiers.indexOf(tier);

                        return (
                            <Input
                                type="number"
                                min={0}
                                max={tier.is_rate ? 100 : undefined}
                                addon={(
                                    tier.is_rate
                                        ? __('fields.tiers.fields.value.addons.rate')
                                        : __('fields.tiers.fields.value.addons.fixed')
                                )}
                                v-model={tier.value}
                                invalid={!!validationErrors?.[index]?.value}
                            />
                        );
                    },
                },
                {
                    key: 'actions',
                    title: '',
                    class: 'ModalDegressiveRateEdition__tiers__item__actions',
                    render: (h: CreateElement, { key }: DegressiveRateTierEdit) => (
                        <Button
                            type="transparent"
                            icon="times"
                            onClick={() => { handleRemoveTier(key); }}
                        />
                    ),
                },
            ];
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e: SubmitEvent) {
            e?.preventDefault();

            this.save();
        },

        handleClose() {
            this.$emit('close', undefined);
        },

        handleAddTier() {
            this.data.tiers.push(getTierDefaults());
        },

        handleRemoveTier(key: DegressiveRateTierEdit['key']) {
            // - Si le palier n'existe pas, on ne va pas plus loin, sinon on la récupère.
            const tierIndex = this.data.tiers.findIndex(
                (_tier: DegressiveRateTierEdit) => _tier.key === key,
            );
            if (tierIndex === -1) {
                return;
            }

            // - On supprime l'erreur de validation liée à la ligne si elle existe,
            //   pour éviter qu'elle ne soit transférée à une autre ligne.
            if (this.validationErrors?.tiers !== undefined) {
                this.$delete(this.validationErrors?.tiers, tierIndex);
            }

            // - On supprime le palier.
            this.data.tiers.splice(tierIndex, 1);
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isSaving) {
                return;
            }

            const { __, degressiveRate, data } = this;
            const isNew = degressiveRate === undefined;
            this.isSaving = true;

            const postData: DegressiveRateEditCore = {
                ...data,
                tiers: data.tiers.map(
                    (tier: DegressiveRateTierEdit) => (
                        omit(tier, ['key'])
                    ),
                ),
            };

            const doRequest = (): Promise<DegressiveRate> => (
                isNew
                    ? apiDegressiveRates.create(postData)
                    : apiDegressiveRates.update(degressiveRate.id, postData)
            );

            try {
                const updatedDegressiveRate = await doRequest();
                this.validationErrors = undefined;

                this.$toasted.success(__('saved'));
                this.$store.dispatch('degressiveRates/refresh');

                this.$emit('close', updatedDegressiveRate);
            } catch (error) {
                this.isSaving = false;

                if (axios.isAxiosError(error)) {
                    const { code, details } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN, details: {} };
                    if (code === ApiErrorCode.VALIDATION_FAILED) {
                        this.validationErrors = { ...details };
                        return;
                    }
                }
                this.$toasted.error(__('global.errors.unexpected-while-saving'));
            }
        },

        __(key: string, params?: Record<string, number | string>, count?: number): string {
            key = !key.startsWith('global.')
                ? `page.settings.degressive-rates.modals.degressive-rate-edition.${key}`
                : key.replace(/^global\./, '');

            return this.$t(key, params, count);
        },
    },
    render() {
        const {
            __,
            data,
            title,
            tiersColumns,
            isSaving,
            validationErrors,
            handleAddTier,
            handleClose,
            handleSubmit,
        } = this;

        return (
            <div class="ModalDegressiveRateEdition">
                <div class="ModalDegressiveRateEdition__header">
                    <h2 class="ModalDegressiveRateEdition__header__title">
                        {title}
                    </h2>
                    <Button
                        type="close"
                        class="ModalDegressiveRateEdition__header__close-button"
                        onClick={handleClose}
                    />
                </div>
                <div class="ModalDegressiveRateEdition__body">
                    <form class="ModalDegressiveRateEdition__form" onSubmit={handleSubmit}>
                        <Fieldset class="ModalDegressiveRateEdition__commons">
                            <FormField
                                type="text"
                                label={__('fields.name.label')}
                                placeholder={__('fields.name.placeholder')}
                                error={validationErrors?.name}
                                v-model={data.name}
                            />
                        </Fieldset>
                        <Fieldset
                            class="ModalDegressiveRateEdition__tiers"
                            title={__('fields.tiers.label')}
                        >
                            {data.tiers.length === 0 && (
                                <EmptyMessage
                                    size="small"
                                    message={__('fields.tiers.empty')}
                                    action={{
                                        type: 'add',
                                        label: __('fields.tiers.add'),
                                        onClick: handleAddTier,
                                    }}
                                />
                            )}
                            {data.tiers.length > 0 && (
                                <Fragment>
                                    <ClientTable
                                        uniqueKey="key"
                                        variant={TableVariant.MINIMALIST}
                                        resizable={false}
                                        paginated={false}
                                        columns={tiersColumns}
                                        data={data.tiers}
                                    />
                                    <Button
                                        type="add"
                                        onClick={handleAddTier}
                                        class="ModalDegressiveRateEdition__tiers__add-button"
                                    >
                                        {__('fields.tiers.add')}
                                    </Button>
                                </Fragment>
                            )}
                        </Fieldset>
                    </form>
                </div>
                <div class="ModalDegressiveRateEdition__footer">
                    <Button type="primary" onClick={handleSubmit} loading={isSaving}>
                        {__('save')}
                    </Button>
                </div>
            </div>
        );
    },
});

export default ModalDegressiveRateEdition;
