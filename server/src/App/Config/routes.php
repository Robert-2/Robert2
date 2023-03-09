<?php
declare(strict_types=1);

return [
    'get' => [
        '/session[/]' => 'AuthController:getSelf',

        '/attributes[/]' => 'AttributeController:getAll',

        '/users[/]' => 'UserController:getAll',
        '/users/{id:(?:[0-9]+|self)}[/]' => 'UserController:getOne',
        '/users/{id:[0-9]+}/settings[/]' => 'UserController:getSettings',

        '/tags[/]' => 'TagController:getAll',

        '/categories[/]' => 'CategoryController:getAll',

        '/persons[/]' => 'PersonController:getAll',

        '/technicians[/]' => 'TechnicianController:getAll',
        '/technicians/{id:[0-9]+}/events[/]' => 'TechnicianController:getEvents',
        '/technicians/while-event/{eventId:[0-9]+}[/]' => 'TechnicianController:getAllWhileEvent',
        '/technicians/{id:[0-9]+}[/]' => 'TechnicianController:getOne',

        '/beneficiaries[/]' => 'BeneficiaryController:getAll',
        '/beneficiaries/{id:[0-9]+}[/]' => 'BeneficiaryController:getOne',

        '/countries[/]' => 'CountryController:getAll',
        '/countries/{id:[0-9]+}[/]' => 'CountryController:getOne',

        '/companies[/]' => 'CompanyController:getAll',
        '/companies/{id:[0-9]+}[/]' => 'CompanyController:getOne',

        '/parks[/]' => 'ParkController:getAll',
        '/parks/list[/]' => 'ParkController:getList',
        '/parks/{id:[0-9]+}[/]' => 'ParkController:getOne',
        '/parks/{id:[0-9]+}/total-amount' => 'ParkController:getOneTotalAmount',
        '/parks/{id:[0-9]+}/materials' => 'ParkController:getOneMaterials',

        '/materials[/]' => 'MaterialController:getAll',
        '/materials/{id:[0-9]+}[/]' => 'MaterialController:getOne',
        '/materials/{id:[0-9]+}/tags[/]' => 'MaterialController:getTags',
        '/materials/{id:[0-9]+}/documents[/]' => 'MaterialController:getAllDocuments',
        '/materials/{id:[0-9]+}/bookings[/]' => 'MaterialController:getBookings',
        '/materials/while-event/{eventId:[0-9]+}[/]' => 'MaterialController:getAllWhileEvent',

        '/events[/]' => 'EventController:getAll',
        '/events/{id:[0-9]+}[/]' => 'EventController:getOne',
        '/events/{id:[0-9]+}/missing-materials[/]' => 'EventController:getMissingMaterials',

        '/event-technicians/{id:[0-9]+}[/]' => 'EventTechnicianController:getOne',

        '/settings[/]' => 'SettingController:getAll',

        '/bookings[/]' => 'BookingController:getAll',
    ],
    'post' => [
        '/session[/]' => 'AuthController:loginWithForm',

        '/users[/]' => 'UserController:create',

        '/categories[/]' => 'CategoryController:create',

        '/subcategories[/]' => 'SubCategoryController:create',

        '/tags[/]' => 'TagController:create',

        '/technicians[/]' => 'TechnicianController:create',

        '/beneficiaries[/]' => 'BeneficiaryController:create',

        '/companies[/]' => 'CompanyController:create',

        '/parks[/]' => 'ParkController:create',

        '/materials[/]' => 'MaterialController:create',
        '/materials/{id:[0-9]+}/documents[/]' => 'MaterialController:handleUploadDocuments',

        '/attributes[/]' => 'AttributeController:create',

        '/events[/]' => 'EventController:create',
        '/events/{id:[0-9]+}/duplicate[/]' => 'EventController:duplicate',
        '/events/{id:[0-9]+}/invoices[/]' => 'EventController:createInvoice',
        '/events/{id:[0-9]+}/estimates[/]' => 'EventController:createEstimate',

        '/event-technicians[/]' => 'EventTechnicianController:create',
    ],
    'put' => [
        '/users/{id:(?:[0-9]+|self)}[/]' => 'UserController:update',
        '/users/restore/{id:[0-9]+}[/]' => 'UserController:restore',
        '/users/{id:[0-9]+}/settings[/]' => 'UserController:updateSettings',

        '/categories/{id:[0-9]+}[/]' => 'CategoryController:update',
        '/categories/restore/{id:[0-9]+}[/]' => 'CategoryController:restore',

        '/subcategories/{id:[0-9]+}[/]' => 'SubCategoryController:update',
        '/subcategories/restore/{id:[0-9]+}[/]' => 'SubCategoryController:restore',

        '/tags/{id:[0-9]+}[/]' => 'TagController:update',
        '/tags/restore/{id:[0-9]+}[/]' => 'TagController:restore',

        '/technicians/{id:[0-9]+}[/]' => 'TechnicianController:update',
        '/technicians/restore/{id:[0-9]+}[/]' => 'TechnicianController:restore',

        '/beneficiaries/{id:[0-9]+}[/]' => 'BeneficiaryController:update',
        '/beneficiaries/restore/{id:[0-9]+}[/]' => 'BeneficiaryController:restore',

        '/companies/{id:[0-9]+}[/]' => 'CompanyController:update',
        '/companies/restore/{id:[0-9]+}[/]' => 'CompanyController:restore',

        '/parks/{id:[0-9]+}[/]' => 'ParkController:update',
        '/parks/restore/{id:[0-9]+}[/]' => 'ParkController:restore',

        '/materials/{id:[0-9]+}[/]' => 'MaterialController:update',
        '/materials/restore/{id:[0-9]+}[/]' => 'MaterialController:restore',

        '/attributes/{id:[0-9]+}[/]' => 'AttributeController:update',

        '/events/{id:[0-9]+}[/]' => 'EventController:update',
        '/events/restore/{id:[0-9]+}[/]' => 'EventController:restore',
        '/events/{id:[0-9]+}/inventory[/]' => 'EventController:updateReturnInventory',
        '/events/{id:[0-9]+}/inventory/finish[/]' => 'EventController:finishReturnInventory',
        '/events/{id:[0-9]+}/archive[/]' => 'EventController:archive',
        '/events/{id:[0-9]+}/unarchive[/]' => 'EventController:unarchive',

        '/event-technicians/{id:[0-9]+}[/]' => 'EventTechnicianController:update',

        '/settings[/]' => 'SettingController:update',
    ],
    'delete' => [
        '/users/{id:[0-9]+}[/]' => 'UserController:delete',
        '/categories/{id:[0-9]+}[/]' => 'CategoryController:delete',
        '/subcategories/{id:[0-9]+}[/]' => 'SubCategoryController:delete',
        '/tags/{id:[0-9]+}[/]' => 'TagController:delete',
        '/technicians/{id:[0-9]+}[/]' => 'TechnicianController:delete',
        '/beneficiaries/{id:[0-9]+}[/]' => 'BeneficiaryController:delete',
        '/companies/{id:[0-9]+}[/]' => 'CompanyController:delete',
        '/parks/{id:[0-9]+}[/]' => 'ParkController:delete',
        '/materials/{id:[0-9]+}[/]' => 'MaterialController:delete',
        '/attributes/{id:[0-9]+}[/]' => 'AttributeController:delete',
        '/events/{id:[0-9]+}[/]' => 'EventController:delete',
        '/event-technicians/{id:[0-9]+}[/]' => 'EventTechnicianController:delete',
        '/documents/{id:[0-9]+}[/]' => 'DocumentController:delete',
        '/estimates/{id:[0-9]+}[/]' => 'EstimateController:delete',
        '/settings/{key:[a-zA-Z0-9-.]+}[/]' => 'SettingController:reset',
    ],
];
