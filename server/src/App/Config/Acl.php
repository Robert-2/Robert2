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

        // - Permaliens publics.
        '/p/',

        //
        // - Api
        //

        '/api/session' => ['POST'],
    ];

    public const ALLOW_LIST = [
        Group::ADMIN => '*',
        Group::MEMBER => [
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
                'createInvoice',
                'createEstimate',
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
                'getOneSummary',
                'updateMaterials',
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
        Group::VISITOR => [
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
