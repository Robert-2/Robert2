<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class FixListTemplateMaterialsIndexes extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        // - Récupère le matériel des modèles de liste et groupe ça par `[list_template_id]-[material_id]`
        //   pour récupérer les doublons ensuite.
        $data = $this->fetchAll(sprintf('SELECT * FROM `%1$slist_template_materials`', $prefix));
        $groupedData = [];
        foreach ($data as $listMaterial) {
            $compositeId = sprintf('%d-%d', $listMaterial['list_template_id'], $listMaterial['material_id']);
            if (!array_key_exists($compositeId, $groupedData)) {
                $groupedData[$compositeId] = [];
            }
            $groupedData[$compositeId][] = $listMaterial['id'];
        }

        // - Pour chaque doublon (= même matériel plusieurs fois dans la même liste),
        //   on garde le doublon le plus récent et on supprime les autres.
        $duplicates = array_filter($groupedData, static fn ($ids) => count($ids) > 1);
        foreach ($duplicates as $duplicateIds) {
            $keptId = max(...$duplicateIds);
            foreach ($duplicateIds as $duplicateId) {
                if ($duplicateId === $keptId) {
                    continue;
                }

                $this->execute(vsprintf(
                    'DELETE FROM `%1$slist_template_materials` WHERE `id` = %2$d',
                    [$prefix, $duplicateId],
                ));
            }
        }

        $list_template_materials = $this->table('list_template_materials');
        $list_template_materials
            ->addIndex(['list_template_id', 'material_id'], ['unique' => true])
            ->update();
    }

    public function down(): void
    {
        $list_template_materials = $this->table('list_template_materials');
        $list_template_materials
            ->removeIndex(['list_template_id', 'material_id'])
            ->update();
    }
}
