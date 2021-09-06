import './index.scss';
import { computed, ref, onMounted } from '@vue/composition-api';
import requester from '@/globals/requester';
import useI18n from '@/hooks/useI18n';
import useRouter from '@/hooks/useRouter';
import Help from '@/components/Help';
import Page from '@/components/Page';
import ParkForm from './Form';
import ParkTotals from './Totals';

import type { Render, SetupContext } from '@vue/composition-api';

type Props = Record<string, never>;

type State = {
    help: string | { type: string, text: string },
    error: unknown | null,
    isLoading: boolean,
    isFetched: boolean,
    park: {
        id: number | 'new' | null,
        name: string,
        street: string,
        // eslint-disable-next-line babel/camelcase
        postal_code: string,
        locality: string,
        // eslint-disable-next-line babel/camelcase
        country_id: string,
        // eslint-disable-next-line babel/camelcase
        total_amount: number,
        note: string,
    },
    errors: {
        name: string | null,
        street: string | null,
        // eslint-disable-next-line babel/camelcase
        postal_code: string | null,
        locality: string | null,
        // eslint-disable-next-line babel/camelcase
        country_id: string | null,
    },
};

const storageKeyWIP = 'WIP-newPark';

// @vue/component
const ParkEditPage = (props: Props, { root }: SetupContext): Render => {
    const __ = useI18n();
    const { route, router } = useRouter();
    const id = computed(() => route.value.params.id || null);
    const isNew = computed(() => !id.value || id.value === 'new');

    const state = ref<State>({
        help: 'page-parks.help-edit',
        error: null,
        isLoading: false,
        isFetched: false,
        park: {
            id: id.value,
            name: '',
            street: '',
            postal_code: '',
            locality: '',
            country_id: '',
            total_amount: 0,
            note: '',
        },
        errors: {
            name: null,
            street: null,
            postal_code: null,
            locality: null,
            country_id: null,
        },
    });

    const initWithStash = (): void => {
        if (!isNew) {
            return;
        }

        const stashedData = localStorage.getItem(storageKeyWIP);
        if (!stashedData) {
            return;
        }

        state.value.park = JSON.parse(stashedData);
    };

    const flushStashedData = (): void => {
        localStorage.removeItem(storageKeyWIP);
    };

    const resetHelpLoading = (): void => {
        state.value.help = 'page-parks.help-edit';
        state.value.error = null;
        state.value.isLoading = true;
    };

    const displayError = (error: unknown): void => {
        state.value.help = 'page-parks.help-edit';
        state.value.error = error;

        // @ts-ignore TODO: Utiliser un typage correct pour la gestion des erreurs de validation de l'API
        const { code, details } = error.response?.data?.error || { code: 0, details: {} };
        if (code === 400) {
            state.value.errors = { ...details };
        }
    };

    const getParkData = async (): Promise<void> => {
        if (isNew.value) {
            initWithStash();
            state.value.isFetched = true;
            return;
        }

        resetHelpLoading();

        try {
            const { data } = await requester.get(`parks/${id.value}`);
            state.value.park = data;
            state.value.isFetched = true;
        } catch (error) {
            displayError(error);
        } finally {
            state.value.isLoading = false;
        }
    };

    const save = async (parkData: Record<string, any>): Promise<void> => {
        resetHelpLoading();

        const request = isNew.value ? requester.post : requester.put;
        const endpoint = isNew.value ? 'parks' : `parks/${id.value}`;

        try {
            const { data } = await request(endpoint, parkData);
            state.value.park = data;
            state.value.help = { type: 'success', text: 'page-parks.saved' };
            flushStashedData();
            root.$store.dispatch('parks/refresh');
            setTimeout(() => { router.push('/parks'); }, 300);
        } catch (error) {
            displayError(error);
        } finally {
            state.value.isLoading = false;
        }
    };

    const handleChange = (newData: Record<string, any>): void => {
        if (!isNew.value) {
            return;
        }

        const stashedData = JSON.stringify(newData);
        localStorage.setItem(storageKeyWIP, stashedData);
    };

    const handleCancel = (): void => {
        flushStashedData();
        router.back();
    };

    onMounted(() => {
        getParkData();
    });

    const pageTitle = isNew ? __('page-parks.add') : __('page-parks.edit', { pageSubTitle: state.value.park.name });

    return () => {
        const {
            isFetched,
            park,
            errors,
            help,
            error,
            isLoading,
        } = state.value;

        return (
            // @ts-ignore TODO: migrer le component Page vers TS
            <Page name="park-edit" title={pageTitle}>
                {isFetched && (
                    <ParkForm
                        park={park}
                        errors={errors}
                        onSubmit={save}
                        onChange={handleChange}
                        onCancel={handleCancel}
                    />
                )}
                <div class="Park__sidebar">
                    {/* @ts-ignore TODO: migrer le component Help vers TS */}
                    <Help
                        message={help}
                        error={error}
                        isLoading={isLoading}
                    />
                    {isFetched && !isNew.value && <ParkTotals park={park} />}
                </div>
            </Page>
        );
    };
};

export default ParkEditPage;
