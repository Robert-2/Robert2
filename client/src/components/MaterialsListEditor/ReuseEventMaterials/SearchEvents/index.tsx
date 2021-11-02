import './index.scss';
import debounce from 'debounce';
import { ref, toRefs } from '@vue/composition-api';
import { getErrorMessage } from '@/utils/errors';
import useI18n from '@/hooks/useI18n';
import apiEvents from '@/stores/api/events';
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
    const totalCount = ref<number>(0);
    const results = ref<EventSummary[]>([]);
    const isLoading = ref<boolean>(false);
    const isFetched = ref<boolean>(false);

    const handleSearch = async (): Promise<void> => {
        const trimedSearchTerm = searchTerm.value.trim();
        if (trimedSearchTerm.length < 2) {
            return;
        }

        isLoading.value = true;

        try {
            const { count, data } = await apiEvents.search({
                search: trimedSearchTerm,
                exclude: exclude?.value || undefined,
            });
            totalCount.value = count;
            results.value = data;
            isFetched.value = true;
        } catch (err) {
            isFetched.value = false;
            root.$toasted.error(getErrorMessage(err, __));
        } finally {
            isLoading.value = false;
        }
    };

    const handleSearchDebounced = debounce(() => {
        handleSearch();
    }, 400);

    const handleKeyUp = (e: KeyboardEvent): void => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            handleSearch();
            return;
        }

        handleSearchDebounced();
    };

    const handleSelect = (id: number): void => {
        emit('select', id);
    };

    return () => {
        const renderResults = (): JSX.Element => {
            if (results.value.length === 0) {
                return (
                    <p class="SearchEvents__no-result">
                        {__('no-result-found-try-another-search')}
                    </p>
                );
            }

            const otherCount = totalCount.value - results.value.length;

            return (
                <div class="SearchEvents__results">
                    <ul class="SearchEvents__results__list">
                        {results.value.map((event: EventSummary) => (
                            <SearchEventResultItem
                                key={event.id}
                                data={event}
                                onSelect={handleSelect}
                            />
                        ))}
                    </ul>
                    {otherCount > 0 && (
                        <p class="SearchEvents__results__count">
                            {__('and-count-more-older-events', { count: otherCount }, otherCount)}
                        </p>
                    )}
                </div>
            );
        };

        return (
            <div class="SearchEvents">
                <div class="SearchEvents__search">
                    <input
                        type="search"
                        vModel={searchTerm.value}
                        placeholder={__('type-to-search-event')}
                        class="SearchEvents__search__input"
                        onKeyup={handleKeyUp}
                    />
                    <button
                        type="button"
                        class="SearchEvents__search__button info"
                        onClick={handleSearch}
                        disabled={isLoading.value}
                    >
                        {isLoading.value
                            ? (<i class="fas fa-circle-notch fa-spin" />)
                            : (<i class="fas fa-search" />)}
                    </button>
                </div>
                {isFetched.value && renderResults()}
            </div>
        );
    };
};

SearchEvents.props = {
    exclude: { type: Number, required: false },
};
SearchEvents.emits = ['select'];

export default SearchEvents;
