import './index.scss';
import { defineComponent } from '@vue/composition-api';
import apiAttributes from '@/stores/api/attributes';
import Page from '@/themes/default/components/Page';
import CriticalError from '@/themes/default/components/CriticalError';
import Loading from '@/themes/default/components/Loading';
import Button from '@/themes/default/components/Button';
import Item from './components/Item';

// @vue/component
const Attributes = defineComponent({
    name: 'Attributes',
    data() {
        return {
            attributes: [],
            isFetched: false,
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

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async fetchData() {
            try {
                this.attributes = await apiAttributes.all();
            } catch {
                this.hasCriticalError = true;
            } finally {
                this.isFetched = true;
            }
        },
    },
    render() {
        const {
            $t: __,
            attributes,
            hasCriticalError,
            isAdding,
            isFetched,
            handleItemDeleted,
        } = this;

        if (hasCriticalError || !isFetched) {
            return (
                <Page name="attributes" title={__('page.attributes.title')}>
                    {hasCriticalError ? <CriticalError /> : <Loading />}
                </Page>
            );
        }

        const isEmpty = !isAdding && attributes.length === 0;

        const headerActions = [
            <Button
                type="add"
                disabled={isAdding}
                to={{ name: 'add-attribute' }}
            >
                {__('page.attributes.add-btn')}
            </Button>,
        ];

        return (
            <Page
                name="attributes"
                title={__('page.attributes.title')}
                help={__('page.attributes.help')}
                actions={headerActions}
            >
                <div class="Attributes">
                    <table class="Attributes__table">
                        <thead class="Attributes__table__header">
                            <tr>
                                <th class="Attributes__table__col Attributes__table__col--name">
                                    {__('page.attributes.name')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--type">
                                    {__('page.attributes.type')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--unit">
                                    {__('page.attributes.unit')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--is-totalisable">
                                    {__('page.attributes.is-totalisable')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--max-length">
                                    {__('page.attributes.max-length')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--categories">
                                    {__('page.attributes.limited-to-categories')}
                                </th>
                                <th class="Attributes__table__col Attributes__table__col--actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attribute) => (
                                <Item
                                    key={attribute.id}
                                    attribute={attribute}
                                    onDeleted={handleItemDeleted}
                                />
                            ))}
                        </tbody>
                    </table>
                    {isEmpty && (
                        <p class="Attributes__no-data">
                            {__('page.attributes.no-attribute-yet')}
                        </p>
                    )}
                </div>
            </Page>
        );
    },
});

export default Attributes;
