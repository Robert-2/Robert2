<?php
declare(strict_types=1);

namespace Robert2\API\Config;

use Robert2\API\Models\Enums\Group;

class Acl
{
    public const PUBLIC_ROUTES = [
        '/install',
        '/login',

        '/calendar/public',

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
                'getAllWhileEvent',
                'getOne',
                'create',
                'update',
                'restore',
                'delete',
            ],
            'Beneficiary' => [
                'getAll',
                'getOne',
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
                'getAllDocuments',
                'getBookings',
                'getAllWhileEvent',
                'create',
                'handleUploadDocuments',
                'update',
                'restore',
                'delete',
                'getPicture',
                'getAllPdf',
            ],
            'Event' => [
                'getAll',
                'getOne',
                'getMissingMaterials',
                'create',
                'duplicate',
                'update',
                'restore',
                'updateReturnInventory',
                'finishReturnInventory',
                'delete',
                'getOnePdf',
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
            ],
            'Document' => [
                'delete',
                'getOne',
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
                'getAllDocuments',
                'getBookings',
                'getAllWhileEvent',
                'getPicture',
                'getAllPdf',
            ],
            'Event' => [
                'getAll',
                'getOne',
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
            ],
            'Document' => [
                'getOne',
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
