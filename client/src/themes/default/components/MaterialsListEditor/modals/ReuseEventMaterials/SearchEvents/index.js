import './index.scss';
import debounce from 'debounce';
import { ref, toRefs } from '@vue/composition-api';
import useI18n from '@/hooks/useI18n';
import apiEvents from '@/stores/api/events';
import Icon from '@/themes/default/components/Icon';
import SearchEventResultItem from './SearchEventResultItem';

// type Props = {
//     /** ID d'un événement à ne pas inclure dans la recherche */
//     exclude?: number | null,

//     /** Déclenché quand un événement est choisi dans la liste. */
//     onSelect(id: number): void,
// };

// @vue/component
const SearchEvents = (props, { root, emit }) => {
    const __ = useI18n();
    const { exclude } = toRefs(props);
    const searchTerm = ref('');
    const totalCount = ref(0);
    const results = ref([]);
    const isLoading = ref(false);
    const isFetched = ref(false);

    const handleSearch = async () => {
        const trimmedSearchTerm = searchTerm.value.trim();
        if (trimmedSearchTerm.length < 2) {
            return;
        }

        isLoading.value = true;

        try {
            const { count, data } = await apiEvents.all({
                search: trimmedSearchTerm,
                exclude: exclude?.value || undefined,
            });
            totalCount.value = count;
            results.value = data;
            isFetched.value = true;
        } catch {
            isFetched.value = false;
            root.$toasted.error(__('errors.unknown'));
        } finally {
            isLoading.value = false;
        }
    };

    const handleSearchDebounced = debounce(() => {
        handleSearch();
    }, 400);

    const handleKeyUp = (e) => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            handleSearch();
            return;
        }

        handleSearchDebounced();
    };

    const handleSelect = (id) => {
        emit('select', id);
    };

    return () => {
        const renderResults = () => {
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
                        {results.value.map((event) => (
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
                        type="text"
                        v-model={searchTerm.value}
                        placeholder={__('type-to-search-event')}
                        class="SearchEvents__search__input"
                        onKeyup={handleKeyUp}
                    />
                    <button
                        type="button"
                        class="SearchEvents__search__button"
                        onClick={handleSearch}
                        disabled={isLoading.value}
                    >
                        {(
                            isLoading.value
                                ? <Icon name="spinner" spin />
                                : <Icon name="search" />
                        )}
                    </button>
                </div>
                {isFetched.value && (
                    <div class="SearchEvents__response">
                        {renderResults()}
                    </div>
                )}
            </div>
        );
    };
};

SearchEvents.props = {
    exclude: { type: Number, required: false },
};
SearchEvents.emits = ['select'];

export default SearchEvents;
