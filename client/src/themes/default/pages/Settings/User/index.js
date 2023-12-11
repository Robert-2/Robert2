import './index.scss';
import { defineComponent } from '@vue/composition-api';
import { Tabs, Tab } from '@/themes/default/components/Tabs';
import Page from '@/themes/default/components/Page';
import ProfileSettings from './tabs/Profile';
import InterfaceSettings from './tabs/Interface';

/** Page des paramètres de l'utilisateur connecté. */
const UserSettings = defineComponent({
    name: 'UserSettings',
    render() {
        const { $t: __ } = this;

        return (
            <Page name="user-settings" title={__('page.user-settings.title')}>
                <Tabs>
                    <Tab title={__('page.user-settings.profile.title')} icon="user-alt">
                        <ProfileSettings />
                    </Tab>
                    <Tab title={__('page.user-settings.interface.title')} icon="paint-brush">
                        <InterfaceSettings />
                    </Tab>
                </Tabs>
            </Page>
        );
    },
});

export default UserSettings;
