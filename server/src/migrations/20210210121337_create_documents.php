<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateDocuments extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('documents', ['signed' => true]);
        $table
            ->addColumn('material_id', 'integer', ['signed' => true, 'null' => false])
            ->addColumn('name', 'string', ['length' => 191, 'null' => false])
            ->addColumn('type', 'string', ['length' => 191, 'null' => false])
            ->addColumn('size', 'integer', ['null' => false])
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_documents_materials',
            ])
            ->addIndex(['material_id', 'name'], [
                'unique' => true,
                'name' => 'material_name_UNIQUE',
            ])
            ->create();
    }

    public function down()
    {
        $this->table('documents')->drop()->save();
    }
}
