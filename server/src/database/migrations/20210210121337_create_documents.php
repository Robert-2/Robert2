<?php
use Phinx\Migration\AbstractMigration;

class CreateDocuments extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('documents');
        $table
            ->addColumn('material_id', 'integer')
            ->addColumn('name', 'string', ['length' => 191])
            ->addColumn('type', 'string', ['length' => 191])
            ->addColumn('size', 'integer')
            ->addColumn('created_at', 'datetime', ['null' => true])
            ->addColumn('updated_at', 'datetime', ['null' => true])
            ->addColumn('deleted_at', 'datetime', ['null' => true])
            ->addIndex(['material_id'])
            ->addForeignKey('material_id', 'materials', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
                'constraint' => 'fk_documents_materials'
            ])
            ->addIndex(['material_id', 'name'], [
                'unique' => true,
                'name' => 'material_name_UNIQUE'
            ])
            ->create();
    }

    public function down()
    {
        $this->table('documents')->drop()->save();
    }
}
