import './index.scss';
import pick from 'lodash/pick';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import formatOptions from '@/utils/formatOptions';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import Button from '@/components/Button';
import apiGroups from '@/stores/api/groups';

const DEFAULT_VALUES = Object.freeze({
    pseudo: '',
    email: '',
    password: '',
    group_id: 'member',
    restricted_parks: [],
    person: {
        first_name: '',
        last_name: '',
        nickname: '',
        phone: '',
        street: '',
        postal_code: '',
        locality: '',
    },
});

// @vue/component
export default {
    name: 'UserEditForm',
    provide: {
        verticalForm: true,
    },
    props: {
        savedData: { type: Object, default: null },
        isSaving: { type: Boolean, default: false },
        errors: { type: Object, default: () => ({}) },
    },
    data() {
        const data = merge({}, DEFAULT_VALUES, {
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
            person: { ...pick(this.savedData?.person ?? {}, Object.keys(DEFAULT_VALUES.person)) },
        });

        return {
            data,
            hasParksRestriction: data.restricted_parks.length > 0,
        };
    },
    computed: {
        isNew() {
            return this.savedData === null;
        },

        groupsOptions() {
            return formatOptions(apiGroups.all());
        },
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSubmit(e) {
            e.preventDefault();

            this.$emit('submit', cloneDeep(this.data));
        },

        handleCancel() {
            this.$emit('cancel');
        },

        handleGroupChange() {
            if (this.isAdmin) {
                this.hasParksRestriction = false;
            }
            this.$emit('change', cloneDeep(this.data));
        },
    },
    render() {
        const {
            $t: __,
            isNew,
            isSaving,
            data,
            errors,
            groupsOptions,
            handleSubmit,
            handleCancel,
            handleGroupChange,
        } = this;

        return (
            <form class="Form Form--fixed-actions" onSubmit={handleSubmit}>
                <Fieldset>
                    <FormField
                        label="pseudo"
                        autocomplete="off"
                        v-model={data.pseudo}
                        errors={errors?.pseudo}
                        required
                    />
                    <FormField
                        label="email"
                        type="email"
                        autocomplete="off"
                        v-model={data.email}
                        errors={errors?.email}
                        required
                    />
                    {isNew && (
                        <FormField
                            label="password"
                            type="password"
                            autocomplete="new-password"
                            v-model={data.password}
                            errors={errors?.password}
                            required
                        />
                    )}
                    <FormField
                        label="group"
                        type="select"
                        v-model={data.group_id}
                        options={groupsOptions}
                        errors={errors?.group_id}
                        onChange={handleGroupChange}
                        help={__('page.user.help-group')}
                        placeholder={false}
                        required
                    />
                </Fieldset>
                <Fieldset title={__('personal-infos')}>
                    <div class="UserEditForm__name">
                        <FormField
                            label="first-name"
                            class="UserEditForm__first-name"
                            autocomplete="off"
                            v-model={data.person.first_name}
                            errors={errors?.person?.first_name}
                            required
                        />
                        <FormField
                            label="last-name"
                            class="UserEditForm__last-name"
                            autocomplete="off"
                            v-model={data.person.last_name}
                            errors={errors?.person?.last_name}
                            required
                        />
                    </div>
                    {/*
                        TODO: Pour la rétro-compatibilité on affiche le champ s'il a déjà été rempli
                        mais à l'avenir il faudrait complètement le supprimer.
                    */}
                    {!!data.person.nickname && (
                        <FormField
                            label="nickname"
                            autocomplete="off"
                            v-model={data.person.nickname}
                            errors={errors?.person?.nickname}
                        />
                    )}
                    <FormField
                        label="phone"
                        type="tel"
                        autocomplete="off"
                        v-model={data.person.phone}
                        errors={errors?.person?.phone}
                    />
                    <FormField
                        label="street"
                        autocomplete="off"
                        v-model={data.person.street}
                        errors={errors?.person?.street}
                    />
                    <div class="UserEditForm__locality">
                        <FormField
                            label="postal-code"
                            class="UserEditForm__postal-code"
                            autocomplete="off"
                            v-model={data.person.postal_code}
                            errors={errors?.person?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="UserEditForm__city"
                            autocomplete="off"
                            v-model={data.person.locality}
                            errors={errors?.person?.locality}
                        />
                    </div>
                </Fieldset>
                <section class="Form__actions">
                    <Button htmlType="submit" type="primary" icon="save" loading={isSaving.value}>
                        {isSaving.value ? __('saving') : __('save')}
                    </Button>
                    <Button icon="ban" onClick={handleCancel}>
                        {__('cancel')}
                    </Button>
                </section>
            </form>
        );
    },
};
