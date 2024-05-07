import './index.scss';
import throttle from 'lodash/throttle';
import { defineComponent } from '@vue/composition-api';
import apiEvents from '@/stores/api/events';
import Icon from '@/themes/default/components/Icon';
import Input from '@/themes/default/components/Input';
import Button from '@/themes/default/components/Button';
import SearchEventResultItem from './SearchEventResultItem';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { EventSummary } from '@/stores/api/events';

type Props = {
    /** ID d'un événement à ne pas inclure dans la recherche. */
    exclude?: number | null,
};

type InstanceProperties = {
    handleSearchDebounced: (
        | DebouncedMethod<typeof SearchEvents, 'handleSearch'>
        | undefined
    ),
};

type Data = {
    searchTerm: string,
    totalCount: number,
    results: EventSummary[],
    isLoading: boolean,
    isFetched: boolean,
};

// @vue/component
const SearchEvents = defineComponent({
    name: 'SearchEvents',
    props: {
        exclude: {
            type: Number as PropType<Props['exclude']>,
            required: false,
            default: null,
        },
    },
    emits: ['select'],
    setup: (): InstanceProperties => ({
        handleSearchDebounced: undefined,
    }),
    data(): Data {
        return {
            searchTerm: '',
            totalCount: 0,
            results: [],
            isLoading: false,
            isFetched: false,
        };
    },
    mounted() {
        this.handleSearchDebounced = throttle(this.handleSearch.bind(this), 400);
    },
    beforeDestroy() {
        this.handleSearchDebounced?.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        async handleSearch() {
            const { $t: __, searchTerm } = this;

            const trimmedSearchTerm = searchTerm.trim();
            if (trimmedSearchTerm.length < 2) {
                return;
            }

            this.isLoading = true;

            try {
                const { count, data } = await apiEvents.all({
                    search: trimmedSearchTerm,
                    exclude: this.exclude ?? undefined,
                });
                this.totalCount = count;
                this.results = data;
                this.isFetched = true;
            } catch {
                this.isFetched = false;
                this.$toasted.error(__('errors.unknown'));
            } finally {
                this.isLoading = false;
            }
        },

        handleSelect(id: MouseEvent) {
            this.$emit('select', id);
        },

        handleKeyup(e: KeyboardEvent) {
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                this.handleSearch();
                return;
            }
            this.handleSearchDebounced!();
        },
    },
    render() {
        const {
            $t: __,
            isLoading,
            isFetched,
            handleSelect,
            handleKeyup,
            handleSearch,
        } = this;

        const renderResults = (): JSX.Element => {
            const { totalCount, results } = this;

            if (results.length === 0) {
                return (
                    <p class="SearchEvents__no-result">
                        {__('no-result-found-try-another-search')}
                    </p>
                );
            }

            const otherCount = totalCount - results.length;

            return (
                <div class="SearchEvents__results">
                    <ul class="SearchEvents__results__list">
                        {results.map((event: EventSummary) => (
                            <SearchEventResultItem
                                key={event.id}
                                event={event}
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
                    <Input
                        type="text"
                        v-model={this.searchTerm}
                        placeholder={__('type-to-search-event')}
                        class="SearchEvents__search__input"
                        onKeyup={handleKeyup}
                    />
                    <Button
                        type="primary"
                        class="SearchEvents__search__button"
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        {(
                            isLoading
                                ? <Icon name="spinner" spin />
                                : <Icon name="search" />
                        )}
                    </Button>
                </div>
                {isFetched && (
                    <div class="SearchEvents__response">
                        {renderResults()}
                    </div>
                )}
            </div>
        );
    },
});

export default SearchEvents;
