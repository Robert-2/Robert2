import './index.scss';
import apiAttributes from '@/stores/api/attributes';
import Page from '@/components/Page';
import CriticalError from '@/components/CriticalError';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Item from './Item';
import AddItem from './AddItem';

// @vue/component
export default {
    name: 'Attributes',
    data() {
        return {
            attributes: [],
            isAdding: false,
            isFetched: false,
            isLoading: false,
            hasCriticalError: false,
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleAddItem() {
            if (this.isAdding) {
                return;
            }

            this.isAdding = true;
            this.$nextTick(() => this.$refs.addItem.focus());
        },

        handleItemAdded(attribute) {
            this.isAdding = false;
            this.attributes.push(attribute);
        },

        handleItemUpdated(attribute) {
            const index = this.attributes.findIndex(
                ({ id }) => id === attribute.id,
            );
            if (index === -1) {
                this.fetchData();
                return;
            }
            this.$set(this.attributes, index, attribute);
        },

        handleItemDeleted(attribute) {
            const index = this.attributes.findIndex(
                ({ id }) => id === attribute.id,
            );
            if (index === -1) {
                this.fetchData();
                return;
            }
            this.attributes.splice(index, 1);
        },

        handleCancelAdding() {
            this.isAdding = false;
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async fetchData() {
            this.isLoading = true;

            try {
                this.attributes = await apiAttributes.all();
                this.isFetched = true;
            } catch (error) {
                this.hasCriticalError = true;
            } finally {
                this.isLoading = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            attributes,
            hasCriticalError,
            isAdding,
            isLoading,
            handleAddItem,
            handleItemAdded,
            handleItemUpdated,
            handleItemDeleted,
            handleCancelAdding,
        } = this;

        if (hasCriticalError || !this.isFetched) {
            return (
                <Page name="attributes" title={__('page-attributes.title')}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        const isEmpty = !isAdding && attributes.length === 0;

        const headerActions = [
            <Button
                type="success"
                icon="plus"
                disabled={isAdding}
                onClick={handleAddItem}
            >
                {__('page-attributes.add-btn')}
            </Button>,
        ];

        return (
            <Page
                name="attributes"
                title={__('page-attributes.title')}
                help={__('page-attributes.help')}
                isLoading={isLoading}
                actions={headerActions}
            >
                <div class="Attributes">
                    <table class="Attributes__table">
                        <thead class="Attributes__table__header">
                            <tr>
                                <th class="Attributes__table__col Attributes__table__col--name">
                                    {__('page-attributes.name')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--type">
                                    {__('page-attributes.type')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--unit">
                                    {__('page-attributes.unit')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--max-length">
                                    {__('page-attributes.max-length')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--categories">
                                    {__('page-attributes.limited-to-categories')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attribute) => (
                                <Item
                                    key={attribute.id}
                                    attribute={attribute}
                                    onUpdated={handleItemUpdated}
                                    onDeleted={handleItemDeleted}
                                />
                            ))}
                        </tbody>
                    </table>
                    {isEmpty && (
                        <p class="Attributes__no-data">
                            {__('page-attributes.no-attribute-yet')}
                        </p>
                    )}
                    {isAdding && (
                        <AddItem
                            ref="addItem"
                            onFinished={handleItemAdded}
                            onCancelled={handleCancelAdding}
                        />
                    )}
                </div>
            </Page>
        );
    },
};
