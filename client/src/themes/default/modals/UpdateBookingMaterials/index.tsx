import './index.scss';
import axios from 'axios';
import { defineComponent } from '@vue/composition-api';
import { debounce } from 'lodash';
import { DEBOUNCE_WAIT_DURATION } from '@/globals/constants';
import { ApiErrorCode } from '@/stores/api/@codes';
import apiBookings, { BookingEntity } from '@/stores/api/bookings';
import MaterialsSelector, {
    getEventMaterialsQuantities,
} from '@/themes/default/components/MaterialsSelector';
import Button from '@/themes/default/components/Button';

import type { DebouncedMethod } from 'lodash';
import type { PropType } from '@vue/composition-api';
import type { Booking, MaterialQuantity } from '@/stores/api/bookings';
import type { SelectedMaterial } from '@/themes/default/components/MaterialsSelector';

type Props = {
    /** Le booking (événement) dont on veut modifier le matériel. */
    booking: Booking,
};

type InstanceProperties = {
    debouncedSave: DebouncedMethod<typeof UpdateBookingMaterialsModal, 'save'> | undefined,
};

type Data = {
    isReady: boolean,
    isSaving: boolean,
    quantities: MaterialQuantity[],
};

/** Fenêtre modale pour modifier la liste du matériel d'un booking. */
const UpdateBookingMaterialsModal = defineComponent({
    name: 'UpdateBookingMaterialsModal',
    props: {
        booking: {
            type: Object as PropType<Props['booking']>,
            required: true,
        },
    },
    modal: {
        width: 1400,
        clickToClose: false,
    },
    emits: ['close'],
    setup: (): InstanceProperties => ({
        debouncedSave: undefined,
    }),
    data(): Data {
        const { entity, materials } = this.booking;
        let quantities: MaterialQuantity[] = [];
        if (entity === BookingEntity.EVENT) {
            quantities = getEventMaterialsQuantities(materials);
        }

        return {
            isReady: false,
            isSaving: false,
            quantities,
        };
    },
    computed: {
        modalTitle(): string {
            const { $t: __, booking } = this;

            if (booking.entity === BookingEntity.EVENT) {
                const { title } = booking;
                return __('modal.update-booking-materials.title-event', { title });
            }

            return __('modal.update-booking-materials.title');
        },

        selectedMaterials(): SelectedMaterial[] {
            const { entity, materials } = this.booking;
            if (entity === BookingEntity.EVENT) {
                return getEventMaterialsQuantities(materials);
            }
            return [];
        },
    },
    created() {
        this.debouncedSave = debounce(
            this.save.bind(this),
            DEBOUNCE_WAIT_DURATION.asMilliseconds(),
        );
    },
    beforeDestroy() {
        this.debouncedSave?.cancel();
    },
    methods: {
        // ------------------------------------------------------
        // -
        // -    Handlers
        // -
        // ------------------------------------------------------

        handleReady() {
            this.isReady = true;
        },

        handleChange(newList: SelectedMaterial[]) {
            this.quantities = newList;
        },

        handleSave() {
            this.debouncedSave!();
        },

        handleClose() {
            this.$emit('close');
        },

        // ------------------------------------------------------
        // -
        // -    Méthodes internes
        // -
        // ------------------------------------------------------

        async save() {
            const { $t: __, isSaving, booking } = this;
            if (isSaving) {
                return;
            }

            const { id, entity } = booking;
            const materials = this.quantities.filter(({ quantity }: MaterialQuantity) => quantity > 0);

            this.isSaving = true;

            try {
                await apiBookings.updateMaterials(entity, id, materials);

                this.$toasted.success(__('modal.update-booking-materials.materials-saved'));
                this.$emit('close');
            } catch (error) {
                this.isSaving = false;
                if (axios.isAxiosError(error)) {
                    const { code } = error.response?.data?.error || { code: ApiErrorCode.UNKNOWN };
                    if (code === ApiErrorCode.EMPTY_PAYLOAD) {
                        this.$toasted.error(__('modal.update-booking-materials.list-cannot-be-empty'));
                        return;
                    }
                }
                this.$toasted.error(__('errors.unexpected-while-saving'));
            }
        },
    },
    render() {
        const {
            $t: __,
            modalTitle,
            handleClose,
            selectedMaterials,
            booking,
            isReady,
            isSaving,
            handleReady,
            handleChange,
            handleSave,
        } = this;

        return (
            <div class="UpdateBookingMaterialsModal">
                <header class="UpdateBookingMaterialsModal__header">
                    <h2 class="UpdateBookingMaterialsModal__header__title">
                        {modalTitle}
                    </h2>
                    <Button
                        type="close"
                        class="UpdateBookingMaterialsModal__header__close-button"
                        onClick={handleClose}
                    />
                </header>
                <div class="UpdateBookingMaterialsModal__body">
                    <MaterialsSelector
                        booking={booking}
                        defaultValues={selectedMaterials}
                        onReady={handleReady}
                        onChange={handleChange}
                    />
                </div>
                {isReady && (
                    <footer class="UpdateBookingMaterialsModal__footer">
                        <Button
                            type="primary"
                            icon="save"
                            onClick={handleSave}
                            loading={isSaving}
                        >
                            {__('save')}
                        </Button>
                    </footer>
                )}
            </div>
        );
    },
});

export default UpdateBookingMaterialsModal;
