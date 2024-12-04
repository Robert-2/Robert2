<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class ReshapeGroups extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        // - Ajout des nouveaux groupes.
        $users = $this->table('users');
        $users
            ->changeColumn('group', 'enum', [
                'values' => [
                    'external',
                    'visitor',
                    'member',
                    'admin',
                    'readonly-planning-general',
                    'management',
                    'administration',
                ],
                'null' => false,
            ])
            ->save();

        // - Réassignation des utilisateurs existants dans les nouveaux groupes.
        $groupsMap = [
            'admin' => 'administration',
            'member' => 'management',
            'visitor' => 'readonly-planning-general',
        ];
        foreach ($groupsMap as $oldGroup => $newGroup) {
            $this->execute(sprintf(
                "UPDATE `%susers` SET `group` = '%s' WHERE `group` = '%s'",
                $prefix,
                $newGroup,
                $oldGroup,
            ));
        }

        // - Suppression des anciens groupes.
        $users
            ->changeColumn('group', 'enum', [
                'values' => [
                    'external',
                    'readonly-planning-self',
                    'readonly-planning-general',
                    'management',
                    'administration',
                ],
                'null' => false,
            ])
            ->save();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        // - Ajout des anciens groupes.
        $users = $this->table('users');
        $users
            ->changeColumn('group', 'enum', [
                'values' => [
                    'external',
                    'visitor',
                    'member',
                    'admin',
                    'readonly-planning-self',
                    'readonly-planning-general',
                    'management',
                    'administration',
                ],
                'null' => false,
            ])
            ->save();

        // - Réassignation des utilisateurs existants dans les anciens groupes.
        $groupsMap = [
            'administration' => 'admin',
            'management' => 'member',
            'readonly-planning-general' => 'visitor',
            'readonly-planning-self' => 'visitor',
        ];
        foreach ($groupsMap as $newGroup => $oldGroup) {
            $this->execute(sprintf(
                "UPDATE `%susers` SET `group` = '%s' WHERE `group` = '%s'",
                $prefix,
                $oldGroup,
                $newGroup,
            ));
        }

        // - Suppression des nouveaux groupes.
        $users
            ->changeColumn('group', 'enum', [
                'values' => [
                    'external',
                    'visitor',
                    'member',
                    'admin',
                ],
                'null' => false,
            ])
            ->save();
    }
}
