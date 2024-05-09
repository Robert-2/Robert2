<?php
declare(strict_types=1);

use Loxya\Config\Config;
use Phinx\Migration\AbstractMigration;

final class FixOutOfOrderQuantities extends AbstractMigration
{
    public function up(): void
    {
        $prefix = Config::get('db.prefix');

        $this->execute(sprintf(
            "UPDATE `%smaterials` SET `out_of_order_quantity` = NULL WHERE `is_unitary` = '1'",
            $prefix,
        ));
    }

    public function down(): void
    {
        // - Pas de rollback pour ce fix.
    }
}
