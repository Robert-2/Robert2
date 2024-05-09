<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Illuminate\Support\Collection;
use Loxya\Models\Enums\BookingViewMode;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Support\Arr;

final class UsersTest extends ApiTestCase
{
    public static function data(?int $id = null, string $format = User::SERIALIZE_DEFAULT)
    {
        $users = (new Collection([
            [
                'id' => 1,
                'pseudo' => 'test1',
                'first_name' => 'Jean',
                'last_name' => 'Fountain',
                'full_name' => 'Jean Fountain',
                'phone' => null,
                'email' => 'tester@robertmanager.net',
                'group' => Group::ADMIN,
                'language' => 'en',
                'default_bookings_view' => BookingViewMode::CALENDAR->value,
            ],
            [
                'id' => 2,
                'pseudo' => 'test2',
                'first_name' => 'Roger',
                'last_name' => 'Rabbit',
                'full_name' => 'Roger Rabbit',
                'phone' => null,
                'email' => 'tester2@robertmanager.net',
                'group' => Group::MEMBER,
                'language' => 'fr',
                'default_bookings_view' => BookingViewMode::CALENDAR->value,
            ],
            [
                'id' => 3,
                'pseudo' => 'nobody',
                'first_name' => null,
                'last_name' => null,
                'full_name' => null,
                'phone' => null,
                'email' => 'nobody@robertmanager.net',
                'group' => Group::MEMBER,
                'language' => 'fr',
                'default_bookings_view' => BookingViewMode::LISTING->value,
            ],
            [
                'id' => 4,
                'pseudo' => 'TheVisitor',
                'first_name' => 'Henry',
                'last_name' => 'Berluc',
                'full_name' => 'Henry Berluc',
                'phone' => '+33724000000',
                'email' => 'visitor@robertmanager.net',
                'group' => Group::VISITOR,
                'language' => 'fr',
                'default_bookings_view' => BookingViewMode::CALENDAR->value,
            ],
            [
                'id' => 5,
                'pseudo' => 'caroline',
                'first_name' => 'Caroline',
                'last_name' => 'Farol',
                'full_name' => 'Caroline Farol',
                'phone' => '+33786325500',
                'email' => 'external@robertmanager.net',
                'group' => Group::VISITOR,
                'language' => 'en',
                'default_bookings_view' => BookingViewMode::CALENDAR->value,
            ],
        ]))->keyBy('id');

        $users = match ($format) {
            User::SERIALIZE_SETTINGS => $users->map(static fn ($user) => (
                Arr::only($user, User::SETTINGS_ATTRIBUTES)
            )),
            User::SERIALIZE_DEFAULT => $users->map(static fn ($user) => (
                Arr::except($user, [
                    ...User::SETTINGS_ATTRIBUTES,
                ])
            )),
            User::SERIALIZE_DETAILS => $users->map(static fn ($user) => (
                Arr::except($user, User::SETTINGS_ATTRIBUTES)
            )),
            User::SERIALIZE_SESSION => $users,
            default => throw new \InvalidArgumentException(sprintf("Unknown format \"%s\"", $format)),
        };

        return $id !== null
            ? $users->get($id)
            : $users->values()->all();
    }

    public function testGetAll(): void
    {
        // - Test simple.
        $this->client->get('/api/users');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(5, [
            self::data(5),
            self::data(3),
            self::data(1),
            self::data(2),
            self::data(4),
        ]);

        // - Test de récupération des enregistrements supprimés.
        $this->client->get('/api/users?deleted=1');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(0);

        // - Test de récupération des membres d'un groupe en particulier.
        $this->client->get(sprintf('/api/users?group=%s', Group::MEMBER));
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponsePaginatedData(2, [
            self::data(3),
            self::data(2),
        ]);
    }

    public function testGetOne(): void
    {
        // - Avec un utilisateur inexistant.
        $this->client->get('/api/users/9999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Avec une récupération de soi-même => Interdit via cet endpoint.
        $this->client->get('/api/users/1');
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);

        // - Avec le mot clé spécial `self` pour soi-même.
        $this->client->get('/api/users/self');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, User::SERIALIZE_DETAILS));
    }

    public function testGetOneSettings(): void
    {
        // - Avec un utilisateur inexistant.
        $this->client->get('/api/users/9999/settings');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Avec une récupération de soi-même => Interdit via cet endpoint.
        $this->client->get('/api/users/1/settings');
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);

        // - Avec le mot clé spécial `self` pour soi-même.
        $this->client->get('/api/users/self/settings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(1, User::SERIALIZE_SETTINGS));

        // - Test valide.
        $this->client->get('/api/users/2/settings');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(self::data(2, User::SERIALIZE_SETTINGS));
    }

    public function testUpdateSettings(): void
    {
        // - Test sans données.
        $this->client->put('/api/users/2/settings', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");

        // - Test avec un utilisateur inexistant.
        $this->client->put('/api/users/999/settings', ['language' => 'fr']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);

        // - Avec une récupération de soi-même => Interdit via cet endpoint.
        $this->client->put('/api/users/1/settings', ['language' => 'fr']);
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);

        // - Test valide.
        $this->client->put('/api/users/2/settings', [
            'language' => 'fr',
            'default_bookings_view' => BookingViewMode::CALENDAR->value,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'language' => 'fr',
            'default_bookings_view' => BookingViewMode::CALENDAR->value,
        ]);

        // - Avec le mot clé spécial `self` pour soi-même.
        $this->client->put('/api/users/self/settings', [
            'language' => 'en',
            'default_bookings_view' => BookingViewMode::LISTING->value,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData([
            'language' => 'en',
            'default_bookings_view' => BookingViewMode::LISTING->value,
        ]);
    }

    public function testCreateBadData(): void
    {
        $this->client->post('/api/users', [
            'email' => 'not-an-email',
            'first_name' => '',
            'last_name' => '',
        ]);
        $this->assertApiValidationError([
            'pseudo' => [
                "This field is mandatory.",
            ],
            'email' => [
                "This email address is invalid.",
            ],
            'group' => [
                "This field is mandatory.",
                "One of the following rules must be verified:",
                'Must equal "admin".',
                'Must equal "member".',
                'Must equal "visitor".',
            ],
            'password' => [
                "This field is mandatory.",
                "4 min. characters, 191 max. characters.",
            ],
            'first_name' => [
                "This field is mandatory.",
                "This field contains some unauthorized characters.",
                "2 min. characters, 35 max. characters.",
            ],
            'last_name' => [
                "This field is mandatory.",
                "This field contains some unauthorized characters.",
                "2 min. characters, 35 max. characters.",
            ],
        ]);
    }

    public function testCreateDuplicate(): void
    {
        $this->client->post('/api/users', [
            'pseudo' => 'test1',
            'first_name' => 'Nouveau',
            'last_name' => 'Testeur',
            'email' => 'tester@robertmanager.net',
            'password' => 'test-dupe',
            'group' => Group::MEMBER,
        ]);
        $this->assertApiValidationError([
            'pseudo' => ["This pseudo is already in use."],
            'email' => ["This email is already in use."],
        ]);
    }

    public function testCreate(): void
    {
        $this->client->post('/api/users', [
            'email' => 'someone@test.org',
            'pseudo' => 'Jeanne',
            'first_name' => 'Jeanne',
            'last_name' => 'Testeur',
            'password' => 'my-ultim4te-paßwor!',
            'group' => Group::MEMBER,
        ]);
        $this->assertStatusCode(StatusCode::STATUS_CREATED);
        $this->assertResponseData([
            'id' => 6,
            'first_name' => 'Jeanne',
            'last_name' => 'Testeur',
            'full_name' => 'Jeanne Testeur',
            'phone' => null,
            'email' => 'someone@test.org',
            'pseudo' => 'Jeanne',
            'group' => Group::MEMBER,
        ]);
    }

    public function testUpdateNoData(): void
    {
        $this->client->put('/api/users/2', []);
        $this->assertStatusCode(StatusCode::STATUS_BAD_REQUEST);
        $this->assertApiErrorMessage("No data was provided.");
    }

    public function testUpdateNotFound(): void
    {
        $this->client->put('/api/users/999', ['pseudo' => '__inexistant__']);
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testForbidUpdateSelfWithId(): void
    {
        $this->client->put('/api/users/1', ['pseudo' => 'Admin']);
        $this->assertStatusCode(StatusCode::STATUS_FORBIDDEN);
    }

    public function testUpdate(): void
    {
        // - L'utilisateur lui-même
        $updatedData = ['pseudo' => 'Admin'];
        $this->client->put('/api/users/self', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(1, User::SERIALIZE_DETAILS),
            $updatedData,
        ));

        // - Un autre utilisateur (en tant qu'admin)
        $updatedData = [
            'pseudo' => 'userEdited',
            'first_name' => 'Edited',
            'last_name' => 'Tester',
            'full_name' => 'Edited Tester',
            'group' => Group::ADMIN,
        ];
        $this->client->put('/api/users/3', $updatedData);
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertResponseData(array_replace(
            self::data(3, User::SERIALIZE_DETAILS),
            $updatedData,
        ));
    }

    public function testDeleteAndDestroy(): void
    {
        // - First call: soft delete.
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $softDeleted = User::withTrashed()->find(3);
        $this->assertNotNull($softDeleted);
        $this->assertNotEmpty($softDeleted->deleted_at);

        // - Second call: actually DESTROY record from DB
        $this->client->delete('/api/users/3');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $this->assertNull(User::withTrashed()->find(3));

        // - Test de suppression d'un utilisateur qui a un bénéficiaire lié
        $this->client->delete('/api/users/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);
        $user = User::withTrashed()->find(2);
        $this->assertNotNull($user);
        $this->assertNotEmpty($user->deleted_at);
    }

    public function testRestoreNotFound(): void
    {
        $this->client->put('/api/users/restore/999');
        $this->assertStatusCode(StatusCode::STATUS_NOT_FOUND);
    }

    public function testRestore(): void
    {
        // - First, delete user #2
        $this->client->delete('/api/users/2');
        $this->assertStatusCode(StatusCode::STATUS_NO_CONTENT);

        // - Then, restore user #2
        $this->client->put('/api/users/restore/2');
        $this->assertStatusCode(StatusCode::STATUS_OK);
        $this->assertNotNull(User::find(2));
    }
}
