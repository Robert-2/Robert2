import './index.scss';
import pick from 'lodash/pick';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import FormField from '@/components/FormField';
import Fieldset from '@/components/Fieldset';
import Button from '@/components/Button';

// TODO: À migrer vers un store.
const GROUP_OPTIONS = Object.freeze([
    { value: 'admin', label: 'admin' },
    { value: 'member', label: 'member' },
    { value: 'visitor', label: 'visitor' },
]);

const DEFAULT_VALUES = Object.freeze({
    pseudo: '',
    email: '',
    password: '',
    group_id: 'member',
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
        savedData: { type: Object, default: () => ({}) },
        isSaving: { type: Boolean, default: false },
        errors: { type: Object, default: () => ({}) },
    },
    data() {
        const id = this.$route.params.id && this.$route.params.id !== 'new'
            ? this.$route.params.id
            : null;

        const data = merge({}, DEFAULT_VALUES, {
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
            person: { ...pick(this.savedData?.person ?? {}, Object.keys(DEFAULT_VALUES.person)) },
        });

        return {
            id,
            data,
        };
    },
    computed: {
        isNew() {
            return this.id === null;
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

        handleChange() {
            this.$emit('change', cloneDeep(this.data));
        },

        handleCancel() {
            this.$emit('cancel');
        },
    },
    render() {
        const {
            $t: __,
            isNew,
            isSaving,
            data,
            errors,
            handleSubmit,
            handleChange,
            handleCancel,
        } = this;

        return (
            <form
                class="Form Form--fixed-actions"
                onSubmit={handleSubmit}
                onChange={handleChange}
            >
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
                        options={GROUP_OPTIONS}
                        errors={errors?.group_id}
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
                            errors={errors?.first_name}
                        />
                        <FormField
                            label="last-name"
                            class="UserEditForm__last-name"
                            autocomplete="off"
                            v-model={data.person.last_name}
                            errors={errors?.last_name}
                        />
                    </div>
                    {/*
                        TODO: Pour la rétro-coimpatibilité on affiche le champ s'il a déjà été rempli
                        mais à l'avenir il faudrait complétement le supprimer.
                    */}
                    {data.person.nickname !== '' && (
                        <FormField
                            label="nickname"
                            autocomplete="off"
                            v-model={data.person.nickname}
                            errors={errors?.nickname}
                        />
                    )}
                    <FormField
                        label="phone"
                        type="tel"
                        autocomplete="off"
                        v-model={data.person.phone}
                        errors={errors?.phone}
                    />
                    <FormField
                        label="street"
                        autocomplete="off"
                        v-model={data.person.street}
                        errors={errors?.street}
                    />
                    <div class="UserEditForm__locality">
                        <FormField
                            label="postal-code"
                            class="UserEditForm__postal-code"
                            autocomplete="off"
                            v-model={data.person.postal_code}
                            errors={errors?.postal_code}
                        />
                        <FormField
                            label="city"
                            class="UserEditForm__city"
                            autocomplete="off"
                            v-model={data.person.locality}
                            errors={errors?.locality}
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
