<?php
declare(strict_types=1);

namespace Loxya\Config;

use Loxya\Models\Enums\Group;

final class Acl
{
    public const PUBLIC_ROUTES = [
        '/healthcheck',
        '/install',
        '/login',

        '/calendar/public',

        '/static',

        //
        // - Api
        //

        '/api/session' => ['POST'],
    ];

    public const ALLOW_LIST = [
        Group::ADMINISTRATION => '*',
        Group::MANAGEMENT => [
            'Auth' => [
                'getSelf',
                'logout',
            ],
            'Attribute' => [
                'getAll',
                'update',
                'delete',
            ],
            'User' => [
                'getOne',
                'getSettings',
                'update',
                'updateSettings',
            ],
            'Tag' => [
                'getAll',
            ],
            'DegressiveRate' => [
                'getAll',
            ],
            'Tax' => [
                'getAll',
            ],
            'Category' => [
                'getAll',
            ],
            'Person' => [
                'getAll',
            ],
            'Technician' => [
                'getAll',
                'getAllWhileEvent',
                'getAllWithAssignments',
                'getEvents',
                'getDocuments',
                'getOne',
                'create',
                'attachDocument',
                'update',
                'restore',
                'delete',
            ],
            'Role' => [
                'getAll',
                'create',
                'update',
                'delete',
            ],
            'Beneficiary' => [
                'getAll',
                'getOne',
                'getBookings',
                'getEstimates',
                'getInvoices',
                'create',
                'update',
                'restore',
                'delete',
            ],
            'Country' => [
                'getAll',
                'getOne',
            ],
            'Company' => [
                'getAll',
                'getOne',
                'create',
                'update',
                'restore',
                'delete',
            ],
            'Park' => [
                'getAll',
                'getList',
                'getOne',
                'getOneTotalAmount',
                'getOneMaterials',
            ],
            'Material' => [
                'getAll',
                'getOne',
                'getTags',
                'getDocuments',
                'getBookings',
                'getAllWhileEvent',
                'create',
                'attachDocument',
                'update',
                'restore',
                'delete',
                'getPicture',
            ],
            'Event' => [
                'getAll',
                'getOne',
                'getOnePdf',
                'getEvents',
                'getDocuments',
                'getMissingMaterials',
                'create',
                'duplicate',
                'attachDocument',
                'update',
                'updateNote',
                'restore',
                'updateDepartureInventory',
                'finishDepartureInventory',
                'cancelDepartureInventory',
                'updateReturnInventory',
                'finishReturnInventory',
                'cancelReturnInventory',
                'delete',
                'createEstimate',
                'createInvoice',
                'archive',
                'unarchive',
                'createAssignment',
                'updateAssignment',
                'deleteAssignment',
                'createPosition',
                'deletePosition',
            ],
            'Invoice' => [
                'getOnePdf',
            ],
            'Estimate' => [
                'getOnePdf',
                'delete',
            ],
            'Setting' => [
                'getAll',
            ],
            'Booking' => [
                'getAll',
                'getOne',
                'getOneSummary',
                'updateMaterials',
                'updateBilling',
            ],
            'BookingMaterial' => [
                'resynchronize',
            ],
            'BookingExtra' => [
                'resynchronize',
            ],
            'Document' => [
                'getFile',
                'delete',
            ],
            'Calendar' => [
                'public',
            ],
            'Entry' => [
                'external',
                'default',
            ],
            'api-catch-not-found',
        ],
        Group::READONLY_PLANNING_GENERAL => [
            'Auth' => [
                'getSelf',
                'logout',
            ],
            'Attribute' => [
                'getAll',
            ],
            'User' => [
                'getOne',
                'getSettings',
                'update',
                'updateSettings',
            ],
            'Tax' => [
                'getAll',
            ],
            'DegressiveRate' => [
                'getAll',
            ],
            'Tag' => [
                'getAll',
            ],
            'Category' => [
                'getAll',
            ],
            'Person' => [
                'getAll',
            ],
            'Technician' => [
                'getAll',
                'getAllWhileEvent',
                'getAllWithAssignments',
                'getEvents',
                'getDocuments',
                'getOne',
            ],
            'Beneficiary' => [
                'getAll',
                'getOne',
            ],
            'Country' => [
                'getAll',
                'getOne',
            ],
            'Company' => [
                'getAll',
                'getOne',
            ],
            'Park' => [
                'getAll',
                'getList',
                'getOne',
                'getOneTotalAmount',
                'getOneMaterials',
            ],
            'Material' => [
                'getAll',
                'getOne',
                'getTags',
                'getDocuments',
                'getBookings',
                'getAllWhileEvent',
                'getPicture',
            ],
            'Event' => [
                'getAll',
                'getOne',
                'getDocuments',
                'getMissingMaterials',
                'getOnePdf',
                'updateNote',
            ],
            'Invoice' => [
                'getOnePdf',
            ],
            'Estimate' => [
                'getOnePdf',
            ],
            'Setting' => [
                'getAll',
            ],
            'Booking' => [
                'getAll',
                'getOne',
                'getOneSummary',
            ],
            'Document' => [
                'getFile',
            ],
            'Calendar' => [
                'public',
            ],
            'Entry' => [
                'external',
                'default',
            ],
            'api-catch-not-found',
        ],
    ];
}
