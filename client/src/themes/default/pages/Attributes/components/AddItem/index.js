import './index.scss';
import apiAttributes from '@/stores/api/attributes';
import Button from '@/themes/default/components/Button';
import Form from './Form';

// @vue/component
export default {
    name: 'AttributesAdd',
    data() {
        return {
            isSaving: false,
            isCancelled: false,
            validationErrors: null,
        };
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Public API
        // -
        // ------------------------------------------------------

        focus() {
            this.$refs.container.scrollIntoView();
            this.$refs.form.focus();
        },

        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleSave(e) {
            e.preventDefault();

            this.save();
        },

        handleCancel() {
            if (this.isSaving) {
                return;
            }

            this.isCancelled = true;
            this.validationErrors = null;
            this.$refs.form.reset();

            this.$emit('cancelled');
        },

        // ------------------------------------------------------
        // -
        // -    Internal methods
        // -
        // ------------------------------------------------------

        async save() {
            if (this.isCancelled || this.isSaving) {
                return;
            }

            const { $t: __ } = this;

            this.validationErrors = null;
            this.isSaving = true;

            try {
                const data = this.$refs.form.getValues();
                const attribute = await apiAttributes.create(data);

                this.$refs.form.reset();
                this.$emit('finished', attribute);
            } catch (error) {
                const { code, details } = error.response?.data?.error || { code: 0, details: {} };
                if (code === 400) {
                    this.validationErrors = { ...details };
                } else {
                    this.$toasted.error(__('errors.unexpected-while-saving'));
                }
            } finally {
                this.isSaving = false;
            }
        },
    },
    render() {
        const {
            $t: __,
            isSaving,
            isCancelled,
            handleSave,
            handleCancel,
            validationErrors,
        } = this;

        if (isCancelled) {
            return null;
        }

        return (
            <form class="AttributesAdd" onSubmit={handleSave} ref="container">
                <Form ref="form" errors={validationErrors} />
                <div class="AttributesAdd__actions">
                    <Button type="primary" htmlType="submit" loading={isSaving}>
                        {__('save')}
                    </Button>
                    <Button disabled={isSaving} onClick={handleCancel}>
                        {__('cancel')}
                    </Button>
                </div>
            </form>
        );
    },
};
