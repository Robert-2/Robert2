import './index.scss';
import TabButton from './TabButton';
import Tab from './Tab';

// @vue/component
const Tabs = {
    name: 'Tabs',
    props: {
        defaultIndex: { type: Number, default: 0 },
        actions: { type: Array, default: undefined },
    },
    data() {
        return {
            selectedIndex: this.defaultIndex,
        };
    },
    methods: {
        handleSelect(index) {
            if (this.selectedIndex === index) {
                return;
            }
            this.selectedIndex = index;
            this.$emit('select', index);
        },
    },
    render() {
        const { actions, selectedIndex, handleSelect } = this;

        // - Ceci ne peut pas être placé dans un computed, car sinon
        // on perd la réactivité du contenu du panel.
        const tabs = this.$slots.default.filter((tab) => (
            tab.componentOptions.Ctor.extendOptions.name === 'Tab'
        ));

        return (
            <div class="Tabs">
                <ul class="Tabs__header" role="tablist">
                    {tabs.map((tab, index) => (
                        <TabButton
                            {...{ props: tab.componentOptions.propsData }}
                            active={selectedIndex === index}
                            onClick={() => { handleSelect(index); }}
                        />
                    ))}
                    {actions && actions.length > 0 && (
                        <div class="Tabs__actions">{actions}</div>
                    )}
                </ul>
                <div class="Tabs__panel" role="tabpanel">
                    {tabs[selectedIndex]}
                </div>
            </div>
        );
    },
};

export { Tabs, Tab };
