<?php
declare(strict_types=1);

namespace Loxya\Services\Auth\Traits;

use Loxya\Config\Config;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Models\Beneficiary;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Services\Auth\Exceptions\AuthException;
use Loxya\Support\Arr;
use Loxya\Support\Str;

trait WithUserCreation
{
    /**
     * Permet de créer un utilisateur à partir d'un identifiant et d'attributs spécifique à un authentifieur.
     *
     * @param string $identifier L'identifiant de l'utilisateur auprès de l'authentifieur.
     * @param array  $attributes Un tableau d'attributs spécifique à l'authentifieur.
     * @param array  $config     Un tableau de configuration permettant à la méthode de savoir comment procéder pour
     *                           la création de l'utilisateur, doit contenir les éléments suivants :
     *                           - `identifierField` : Le nom du champ contenant l'identifiant de
     *                                                 l'utilisateur auprès de l'authentifieur dans la modèle `User`.
     *                           - `attributesMapping` : Un tableau de mise en correspondance des attributs de Loxya
     *                                                   avec ceux de l'authentifieur (e.g. `['pseudo' => 'givenName']`).
     *                                                   Si le nom de la l'attribut côté authentifieur est un tableau,
     *                                                   la valeur sera recherchée sous tous ces noms.
     *                                                   Liste des champs pouvant être mappés :
     *                                                   `pseudo`, `email`, `group`, `firstName`, `lastName`
     *                           - `groupsMapping` : Un tableau de mise en correspondance des groupes côté authentifieur
     *                                               avec ceux de Loxya (e.g. `['GroupeVisiteur' => 'external']`).
     *                           - `linkExistingUser` : Un booléen indiquant si l'on souhaite automatiquement lié les
     *                                                  utilisateurs existants dans Loxya aux utilisateurs de l'authentifieur.
     *                                                  L'élément permettant de reconnaître des comptes appartenant à la même
     *                                                  personne étant l'adresse email.
     *                           - `defaultGroup` : Le groupe par défaut à utiliser si le groupe n'a pas pu être récupéré
     *                                              via les attributs passés. Si `null`.
     *                           - `beneficiaryGroups` : Un ou plusieurs groupes de l'authentifieur qui, si au moins un est présent,
     *                                                   permettra de créer automatiquement un bénéficiaire lié à l'utilisateur.
     *                                                   Utiliser "*" (étoile) pour signifier que tous les groupes, ou
     *                                                   l'absence de groupe, créera automatiquement un bénéficiaire lié.
     *                           - `defaultEmailHost` : L'hôte à utiliser pour l'adresse email "fake" générée si celle-ci n'a pas pu être
     *                                                  récupérée depuis les attributs. La partie "identifiant" de l'email utilisera le
     *                                                  pseudo, s'il a pu être récupéré, sinon l'identifiant de l'utilisateur auprès
     *                                                  de l'authentifieur.
     *
     * @return User L'utilisateur tout juste créé.
     *
     * @throws AuthException     Si l'utilisateur n'a pas pu être créé à cause d'une raison propre à l'identifieur.
     * @throws \LogicException   Si l'utilisateur n'a pas pu être créé à cause d'une de configuration de l'identifieur.
     * @throws \RuntimeException Si l'utilisateur n'a pas pu être créé à cause d'une pendant l'execution.
     */
    private function createUserFromAttributes(string $identifier, array $attributes, array $config): User
    {
        $attributesMap = Arr::get($config, 'attributesMapping', []);
        $getAttribute = static function ($name, $firstOnly = true) use ($attributesMap, $attributes) {
            if (empty($attributesMap[$name])) {
                return null;
            }

            foreach ((array) $attributesMap[$name] as $attr) {
                if (!empty($attributes[$attr])) {
                    $value = $attributes[$attr];
                    return is_array($value) && $firstOnly
                        ? array_values($value)[0]
                        : $value;
                }
            }

            return null;
        };

        // - Pseudo
        $pseudo = $getAttribute('pseudo') ?? $identifier;
        $pseudo = substr(Str::slugify($pseudo), 0, 100);

        // - Email
        $email = $getAttribute('email');
        $existingUser = $email !== null ? User::fromEmail($email) : null;
        if ($existingUser !== null) {
            if (!Arr::get($config, 'linkExistingUser', false)) {
                throw new AuthException(
                    'The user already exists but is not linked to this authenticator. ' .
                    'As auto-linking is disabled, we can\'t go any further.',
                );
            }

            $oldIdentifier = $existingUser->{$config['identifierField']};
            if ($oldIdentifier !== null && $oldIdentifier !== $identifier) {
                throw new AuthException(vsprintf(
                    'The user already exists but is not linked to the same authenticator identifier. ' .
                    '(existing: `%s`, new: `%s`). Should be fixed manually because we\'re not sure ' .
                    'it\'s the same account.',
                    [$oldIdentifier, $identifier],
                ));
            }

            return tap($existingUser, static function (User $existingUser) use ($identifier, $config) {
                $existingUser->{$config['identifierField']} = $identifier;
                $existingUser->save();
                $existingUser->refresh();
            });
        }
        $email ??= sprintf('%s@%s', $pseudo, $config['defaultEmailHost']);

        // - Group
        $group = null;
        $isBeneficiary = false;
        $internalGroups = array_flip(Group::all());
        $externalGroups = $getAttribute('group', false) ?? null;
        if (!empty($externalGroups) || $externalGroups === 0) {
            if (!is_array($externalGroups)) {
                $externalGroups = array_map('trim', explode(',', $externalGroups));
            }

            if (!empty($config['beneficiaryGroups'])) {
                $isBeneficiary = (
                    $config['beneficiaryGroups'] === '*' ||
                    count(array_intersect($externalGroups, (array) $config['beneficiaryGroups'])) > 0
                );
            }

            // - Attention à l'ordre de priorité des groupes, qui doit être ascendant.
            $group = array_reduce(
                $externalGroups,
                static function ($prevGroup, $samlGroup) use ($internalGroups, $config) {
                    if (!array_key_exists($samlGroup, $config['groupsMapping'])) {
                        return $prevGroup;
                    }

                    $currentGroup = $config['groupsMapping'][$samlGroup];
                    if (!array_key_exists($currentGroup, $internalGroups)) {
                        throw new \LogicException(vsprintf(
                            "The destination group `%s` mapped to `%s` does not exist, " .
                            "please check the authenticator configuration.",
                            [$currentGroup, $samlGroup],
                        ));
                    }

                    if ($prevGroup !== null && $internalGroups[$prevGroup] >= $internalGroups[$currentGroup]) {
                        return $prevGroup;
                    }

                    return $currentGroup;
                },
                null,
            );
        }

        // - Si le groupe n'a pas pû être récupéré, on utilise le groupe par défaut, s'il existe et qu'il est valide.
        if ($group === null && !empty($config['defaultGroup'])) {
            if (!array_key_exists($config['defaultGroup'], $internalGroups)) {
                throw new \LogicException(sprintf(
                    "The group configured as default `%s` does not exist, " .
                    "please check the authenticator configuration.",
                    $config['defaultGroup'],
                ));
            }
            $group = $config['defaultGroup'];
        }

        // - Si, malgré tout, on a pas pu récupérer de groupe pour l'utilisateur,
        //   On arrête là et on empêche la connexion.
        if ($group === null) {
            throw new AuthException("As the user could not be linked to a group, the creation failed.");
        }

        try {
            return dbTransaction(static function () use (
                $pseudo,
                $email,
                $group,
                $config,
                $getAttribute,
                $identifier,
                $isBeneficiary,
            ) {
                /** @var User $user */
                $user = User::new([
                    'pseudo' => $pseudo,
                    'email' => $email,
                    'group' => $group,
                    'password' => (string) Str::uuid(),
                    'person' => [
                        'first_name' => $getAttribute('firstName'),
                        'last_name' => $getAttribute('lastName'),
                    ],
                    $config['identifierField'] => $identifier,
                    'language' => Config::get('defaultLang'),
                ]);

                if ($isBeneficiary) {
                    $beneficiary = new Beneficiary(['can_make_reservation' => true]);
                    $beneficiary->person()->associate($user->person);

                    if (!$beneficiary->save()) {
                        throw new \RuntimeException("Unable to save the beneficiary.");
                    }
                }

                return $user->refresh();
            });
        } catch (ValidationException $e) {
            throw new \RuntimeException(implode("\n", [
                sprintf("Retrieved user data for \"%s\" was incomplete / invalid.", $identifier),
                sprintf('(validation errors: %s)', json_encode($e->getValidationErrors())),
                sprintf('(attributes: %s)', json_encode($attributes)),
            ]));
        }
    }
}
