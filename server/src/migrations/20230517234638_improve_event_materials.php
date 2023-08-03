<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Monolog\Logger;
use Phinx\Migration\AbstractMigration;

final class ImproveEventMaterials extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::getSettings('db')['prefix'];

        // - Récupère le matériel des événements et groupe ça par `[event_id]-[material_id]`
        //   pour récupérer les doublons ensuite.
        $data = $this->fetchAll(sprintf(
            'SELECT em.*, m.is_unitary
             FROM `%1$sevent_materials` as em
             INNER JOIN `%1$smaterials` as m ON em.material_id = m.id',
            $prefix
        ));
        $groupedData = [];
        foreach ($data as $eventMaterial) {
            $compositeId = sprintf('%d-%d', $eventMaterial['event_id'], $eventMaterial['material_id']);
            if (!array_key_exists($compositeId, $groupedData)) {
                $groupedData[$compositeId] = [
                    'event_id' => $eventMaterial['event_id'],
                    'material_id' => $eventMaterial['material_id'],
                    'is_unitary' => (bool) $eventMaterial['is_unitary'],
                    'values' => [],
                ];
            }
            $groupedData[$compositeId]['values'][] = [
                'id' => $eventMaterial['id'],
                'quantity' => $eventMaterial['quantity'],
            ];
        }

        // - Pour chaque doublon (= même matériel plusieurs fois dans le même événement), on vérifie:
        //   - Si la quantité est identique entre chaque doublon.
        //   - Si les unités sélectionnées sont identiques entre chaque doublon.
        //   => Si non, ne peut pas être résolu automatiquement.
        //   => Si oui, on garde le doublon le plus récent et on supprime les autres.
        $duplicates = array_filter($groupedData, fn ($data) => count($data['values']) > 1);
        foreach ($duplicates as &$duplicate) {
            if ($duplicate['is_unitary']) {
                foreach ($duplicate['values'] as &$value) {
                    $value['units'] = array_column(
                        $this->fetchAll(vsprintf(
                            'SELECT material_unit_id FROM `%1$sevent_material_units` WHERE `event_material_id` = %2$d',
                            [$prefix, $value['id']]
                        )),
                        'material_unit_id'
                    );
                }
            }

            $duplicate['fixable'] = true;
            $values = $duplicate['values'];
            $reference = array_shift($values);
            foreach ($values as $current) {
                if ($current['quantity'] !== $reference['quantity']) {
                    $duplicate['fixable'] = false;
                    break;
                }

                if ($duplicate['is_unitary']) {
                    $areUnitsIdentical = (
                        empty(array_diff($reference['units'], $current['units'])) &&
                        empty(array_diff($current['units'], $reference['units']))
                    );
                    if (!$areUnitsIdentical) {
                        $duplicate['fixable'] = false;
                        break;
                    }
                }

                $idToDelete = $current['id'];
                if ($current['id'] > $reference['id']) {
                    $idToDelete = $reference['id'];
                    $reference = $current;
                }

                $this->execute(vsprintf(
                    'DELETE FROM `%1$sevent_materials` WHERE `id` = %2$d',
                    [$prefix, $idToDelete]
                ));
            }
        }

        // - Dans le cas ou on a des doublons que l'on ne peut pas corriger automatiquement,
        //   on lève une exception et on log le détail des doublons problématique pour simplifier
        //   la correction.
        $unfixableDuplicates = array_filter($duplicates, fn ($data) => !$data['fixable']);
        if (count($unfixableDuplicates) > 0) {
            container('logger')->log(Logger::ERROR, sprintf(
                "Unfixable `event_materials` duplicate:\n%s",
                var_export($unfixableDuplicates, true)
            ));
            throw new \Exception(
                "The `event_materials` table contains some duplicate (event_id / material_id) " .
                "that are not fixable automatically. Please see the app logs for details."
            );
        }

        $event_materials = $this->table('event_materials');
        $event_materials
            ->addIndex(['event_id', 'material_id'], [
                'unique' => true,
            ])
            ->update();
    }

    public function down(): void
    {
        $event_materials = $this->table('event_materials');
        $event_materials
            ->removeIndex(['event_id', 'material_id'])
            ->update();
    }
}
