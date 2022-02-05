import { Tabs, Tab } from 'vue-slim-tabs';
import Page from '@/components/Page';
import ProfileSettings from './Profile';
import InterfaceSettings from './Interface';

// @vue/component
export default {
    name: 'UserSettings',
    render() {
        const { $t: __ } = this;

        return (
            <Page name="user-settings" title={__('page-user-settings.title')}>
                <Tabs>
                    <template slot="profile">
                        <i class="fas fa-user-alt" /> {__('page-user-settings.profile.title')}
                    </template>
                    <template slot="interface">
                        <i class="fas fa-paint-brush" /> {__('page-user-settings.interface.title')}
                    </template>
                    <Tab title-slot="profile">
                        <ProfileSettings />
                    </Tab>
                    <Tab title-slot="interface">
                        <InterfaceSettings />
                    </Tab>
                </Tabs>
            </Page>
        );
    },
};
