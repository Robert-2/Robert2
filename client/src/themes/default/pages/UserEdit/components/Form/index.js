import './index.scss';
import pick from 'lodash/pick';
import cloneDeep from 'lodash/cloneDeep';
import formatOptions from '@/utils/formatOptions';
import FormField from '@/themes/default/components/FormField';
import Fieldset from '@/themes/default/components/Fieldset';
import Button from '@/themes/default/components/Button';
import { Group } from '@/stores/api/groups';

const DEFAULT_VALUES = Object.freeze({
    first_name: '',
    last_name: '',
    pseudo: '',
    email: '',
    phone: '',
    password: '',
    group: Group.MANAGEMENT,
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
    emits: ['change', 'submit', 'cancel'],
    data() {
        const data = {
            ...DEFAULT_VALUES,
            ...pick(this.savedData ?? {}, Object.keys(DEFAULT_VALUES)),
        };

        return {
            data,
        };
    },
    computed: {
        isNew() {
            return this.savedData === null;
        },

        groupsOptions() {
            const groups = this.$store.state.groups.list;

            return formatOptions(groups);
        },
    },
    created() {
        this.$store.dispatch('groups/fetch');
    },
    mounted() {
        if (this.isNew) {
            this.$nextTick(() => {
                const $inputPseudo = this.$refs.inputPseudo;
                $inputPseudo?.focus();
            });
        }
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
                        ref="inputPseudo"
                        label="pseudo"
                        autocomplete="off"
                        v-model={data.pseudo}
                        error={errors?.pseudo}
                        required
                    />
                    <FormField
                        label="email"
                        type="email"
                        autocomplete="off"
                        v-model={data.email}
                        error={errors?.email}
                        required
                    />
                    {isNew && (
                        <FormField
                            label="password"
                            type="password"
                            autocomplete="new-password"
                            v-model={data.password}
                            error={errors?.password}
                            required
                        />
                    )}
                    <FormField
                        label="access"
                        type="select"
                        v-model={data.group}
                        options={groupsOptions}
                        error={errors?.group}
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
                            v-model={data.first_name}
                            error={errors?.first_name}
                            required
                        />
                        <FormField
                            label="last-name"
                            class="UserEditForm__last-name"
                            autocomplete="off"
                            v-model={data.last_name}
                            error={errors?.last_name}
                            required
                        />
                    </div>
                    <FormField
                        label="phone"
                        type="tel"
                        autocomplete="off"
                        v-model={data.phone}
                        error={errors?.phone}
                    />
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
