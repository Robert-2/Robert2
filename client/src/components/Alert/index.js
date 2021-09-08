import Swal from 'sweetalert2/dist/sweetalert2';

const ConfirmDelete = ($t, entityName, isSoft = true) => Swal.fire({
    title: $t('please-confirm'),
    text: isSoft
        ? $t(`page-${entityName}.confirm-delete`)
        : $t(`page-${entityName}.confirm-permanently-delete`),
    icon: 'warning',
    showCancelButton: true,
    customClass: {
        confirmButton: isSoft ? 'swal2-confirm--trash' : 'swal2-confirm--delete',
    },
    confirmButtonText: isSoft ? $t('yes-delete') : $t('yes-permanently-delete'),
    cancelButtonText: $t('cancel'),
});

const ConfirmRestore = ($t, entityName) => Swal.fire({
    title: $t('please-confirm'),
    text: $t(`page-${entityName}.confirm-restore`),
    icon: 'warning',
    showCancelButton: true,
    customClass: {
        confirmButton: 'swal2-confirm--restore',
    },
    confirmButtonText: $t('yes-restore'),
    cancelButtonText: $t('cancel'),
});

export default { ConfirmDelete, ConfirmRestore };
