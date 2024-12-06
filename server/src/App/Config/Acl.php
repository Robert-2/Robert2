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
                'getEvents',
                'getDocuments',
                'getAllWhileEvent',
                'getOne',
                'create',
                'attachDocument',
                'update',
                'restore',
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
                'getAllPdf',
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
            ],
            'EventTechnician' => [
                'getOne',
                'create',
                'update',
                'delete',
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
                'getEvents',
                'getDocuments',
                'getAllWhileEvent',
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
                'getAllPdf',
            ],
            'Event' => [
                'getAll',
                'getOne',
                'getDocuments',
                'getMissingMaterials',
                'getOnePdf',
            ],
            'EventTechnician' => [
                'getOne',
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
        Group::READONLY_PLANNING_SELF => [
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
            'Tag' => [
                'getAll',
            ],
            'Category' => [
                'getAll',
            ],
            'Country' => [
                'getAll',
                'getOne',
            ],
            'Park' => [
                'getAll',
                'getList',
                'getOne',
            ],
            'Material' => [
                'getPicture',
            ],
            'Event' => [
                'getAll',
                'getOne',
                'getDocuments',
                'getMissingMaterials',
                'getOnePdf',
                'update',
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
            'Invoice' => [
                'getOnePdf',
            ],
            'Estimate' => [
                'getOnePdf',
            ],
            'Entry' => [
                'external',
                'default',
            ],
            'api-catch-not-found',
        ],
    ];
}
