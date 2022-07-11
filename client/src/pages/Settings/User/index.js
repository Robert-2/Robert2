import './index.scss';
import { Tabs, Tab } from '@/components/Tabs';
import Page from '@/components/Page';
import ProfileSettings from './tabs/Profile';
import InterfaceSettings from './tabs/Interface';

// @vue/component
export default {
    name: 'UserSettingsPage',
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
};
