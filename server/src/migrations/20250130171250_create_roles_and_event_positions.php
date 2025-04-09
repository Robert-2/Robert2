<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class CreateRolesAndEventPositions extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        //
        // - Rôles des techniciens.
        //

        $roles = $this->table('roles', ['signed' => true]);
        $roles
            ->addColumn('name', 'string', [
                'limit' => 191,
                'null' => false,
            ])
            ->addColumn('created_at', 'datetime', [
                'null' => false,
                'default' => 'CURRENT_TIMESTAMP',
            ])
            ->addColumn('updated_at', 'datetime', [
                'null' => true,
                'update' => 'CURRENT_TIMESTAMP',
            ])
            ->create();

        $technicianRoles = $this->table('technician_roles', ['signed' => true]);
        $technicianRoles
            ->addColumn('technician_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('role_id', 'integer', ['signed' => true, 'null' => false])
            ->addIndex(['technician_id'])
            ->addForeignKey('technician_id', 'technicians', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__technician_roles__technician',
            ])
            ->addIndex(['role_id'])
            ->addForeignKey('role_id', 'roles', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__technician_roles__role',
            ])
            ->addIndex(['technician_id', 'role_id'], ['unique' => true])
            ->create();

        //
        // - Postes des techniciens dans les événements.
        //

        $eventPositions = $this->table('event_positions', ['signed' => true]);
        $eventPositions
            ->addColumn('event_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('role_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('is_mandatory', 'boolean', [
                'null' => false,
                'default' => false,
            ])
            ->addIndex(['event_id'])
            ->addForeignKey('event_id', 'events', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_positions__event',
            ])
            ->addIndex(['role_id'])
            ->addForeignKey('role_id', 'roles', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_positions__role',
            ])
            ->addIndex(['event_id', 'role_id'], ['unique' => true])
            ->create();

        //
        // - Insère les rôles existants.
        //

        $positionsData = $this->fetchAll(vsprintf(
            'SELECT DISTINCT `event_technician`.`position`
            FROM `%1$sevent_technicians` AS `event_technician`
            WHERE `event_technician`.`position` IS NOT NULL',
            [$prefix],
        ));
        foreach ($positionsData as $positionDatum) {
            $roles
                ->insert(['name' => $positionDatum['position']])
                ->save();
        }

        //
        // - Ajoute le poste aux assignations de techniciens des événements.
        //

        $eventTechnicians = $this->table('event_technicians');
        $eventTechnicians
            ->addColumn('role_id', 'integer', [
                'after' => 'position',
                'signed' => true,
                'null' => true,
            ])
            ->addIndex(['role_id'])
            ->addForeignKey('role_id', 'roles', 'id', [
                'delete' => 'SET_NULL',
                'update' => 'NO_ACTION',
                'constraint' => 'fk__event_technicians__role',
            ])
            ->update();

        //
        // - Enregistre les rôles pour chaque poste existant dans les
        //   assignations de techniciens aux événements.
        //

        $eventTechniciansData = $this->fetchAll(vsprintf('SELECT * FROM `%1$sevent_technicians`', [$prefix]));
        foreach ($eventTechniciansData as $eventTechnician) {
            if ($eventTechnician['position'] === null) {
                continue;
            }

            $role = $this->fetchRow(vsprintf(
                'SELECT `id` FROM `%1$sroles` WHERE `name` = "%2$s"',
                [$prefix, $eventTechnician['position']],
            ));
            if ($role === false) {
                continue;
            }

            // - Poste dans l'événement.
            $eventPositionAlreadyExist = (
                (int) $this->fetchRow(vsprintf(
                    'SELECT COUNT(*) AS `count`
                     FROM `%1$sevent_positions`
                     WHERE `event_id` = %2$d AND `role_id` = %3$d',
                    [$prefix, $eventTechnician['event_id'], $role['id']],
                ))['count']
            ) !== 0;
            if (!$eventPositionAlreadyExist) {
                $eventPositions
                    ->insert([
                        'event_id' => $eventTechnician['event_id'],
                        'role_id' => $role['id'],
                        'is_mandatory' => false,
                    ])
                    ->save();
            }

            // - Rôle du technicien.
            $technicianRoleAlreadyExist = (
                (int) $this->fetchRow(vsprintf(
                    'SELECT COUNT(*) AS `count`
                     FROM `%1$stechnician_roles`
                     WHERE `technician_id` = %2$d AND `role_id` = %3$d',
                    [$prefix, $eventTechnician['technician_id'], $role['id']],
                ))['count']
            ) !== 0;
            if (!$technicianRoleAlreadyExist) {
                $technicianRoles
                    ->insert([
                        'technician_id' => $eventTechnician['technician_id'],
                        'role_id' => $role['id'],
                    ])
                    ->save();
            }

            // - Rôle pour l'assignation du technicien.
            $this->execute(vsprintf(
                'UPDATE `%1$sevent_technicians` SET `role_id` = %2$d WHERE `id` = %3$d',
                [$prefix, $role['id'], $eventTechnician['id']],
            ));
        }

        // - Supprime la colonne `position` des assignations de techniciens.
        $eventTechnicians
            ->removeColumn('position')
            ->update();
    }

    public function down(): void
    {
        $prefix = Config::get('db.prefix');

        // - Remet la colonne `position` dans les assignations de techniciens.
        $eventTechnicians = $this->table('event_technicians');
        $eventTechnicians
            ->addColumn('position', 'string', [
                'after' => 'end_date',
                'limit' => 191,
                'null' => true,
            ])
            ->update();

        // - Récupère les rôles des techniciens pour les remettre dans la colonne `position`.
        $eventTechniciansData = $this->fetchAll(vsprintf('SELECT * FROM `%1$sevent_technicians`', [$prefix]));
        foreach ($eventTechniciansData as $eventTechnician) {
            if ($eventTechnician['role_id'] === null) {
                continue;
            }

            $role = $this->fetchRow(vsprintf(
                'SELECT `name` FROM `%1$sroles` WHERE `id` = %2$d',
                [$prefix, $eventTechnician['role_id']],
            ));
            if ($role === false) {
                continue;
            }

            $this->execute(vsprintf(
                'UPDATE `%1$sevent_technicians` SET `position` = "%2$s" WHERE `id` = %3$d',
                [$prefix, $role['name'], $eventTechnician['id']],
            ));
        }

        // - Supprime la colonne `role_id` des assignations de techniciens.
        $eventTechnicians
            ->dropForeignKey('role_id')
            ->save();
        $eventTechnicians
            ->removeColumn('role_id')
            ->update();

        // - Supprime les tables.
        $this->table('event_positions')->drop()->save();
        $this->table('technician_roles')->drop()->save();
        $this->table('roles')->drop()->save();
    }
}
