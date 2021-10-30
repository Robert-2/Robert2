import './index.scss';
import { ref, toRefs } from '@vue/composition-api';
import { getErrorMessage } from '@/utils/errors';
import useI18n from '@/hooks/useI18n';
import apiEvents from '@/stores/api/events';
import Loading from '@/components/Loading';
import SearchEventResultItem from './SearchEventResultItem';

import type { Component, SetupContext } from '@vue/composition-api';
import type { EventSummary } from '@/stores/api/events';

type Props = {
    /** ID d'un événement à ne pas inclure dans la recherche */
    exclude?: number | null,

    /** Déclenché quand un événement est choisi dans la liste. */
    onSelect(id: number): void,
};

// @vue/component
const SearchEvents: Component<Props> = (props: Props, { root, emit }: SetupContext) => {
    const __ = useI18n();
    const { exclude } = toRefs(props);
    const searchTerm = ref<string>('');
    const results = ref<EventSummary[]>([]);
    const isLoading = ref<boolean>(false);
    const isFetched = ref<boolean>(false);

    const handleSearch = async (): Promise<void> => {
        const trimedSearchTerm = searchTerm.value.trim();
        if (trimedSearchTerm.length < 2) {
            return;
        }

        isLoading.value = true;
        isFetched.value = false;

        try {
            results.value = await apiEvents.search({
                title: trimedSearchTerm,
                exclude: exclude?.value || undefined,
            });
            isFetched.value = true;
        } catch (err) {
            isFetched.value = false;
            root.$toasted.error(getErrorMessage(err, __));
        } finally {
            isLoading.value = false;
        }
    };

    const handleSelect = (id: number): void => {
        emit('select', id);
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
        if (e.code !== 'Enter' && e.code !== 'NumpadEnter') {
            return;
        }

        handleSearch();
    };

    return () => (
        <div class="SearchEvents">
            <div class="SearchEvents__search">
                <input
                    type="search"
                    vModel={searchTerm.value}
                    placeholder={__('type-to-search-event')}
                    class="SearchEvents__search__input"
                    onKeyup={handleKeyUp}
                />
                <button type="button" class="SearchEvents__search__button info" onClick={handleSearch}>
                    <i class="fas fa-search" />
                </button>
            </div>
            {isLoading.value && <Loading horizontal />}
            {isFetched.value && (
                <div class="SearchEvents__results">
                    {results.value.length === 0 && (
                        <p class="SearchEvents__no-result">
                            {__('no-result-found-try-another-search')}
                        </p>
                    )}
                    {results.value.length > 0 && (
                        <ul class="SearchEvents__results__list">
                            {results.value.map((event: EventSummary) => (
                                <SearchEventResultItem
                                    key={event.id}
                                    data={event}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

SearchEvents.props = {
    exclude: { type: Number, required: false },
};
SearchEvents.emits = ['select'];

export default SearchEvents;
