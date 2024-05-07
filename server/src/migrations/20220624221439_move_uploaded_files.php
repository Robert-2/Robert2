<?php
declare(strict_types=1);

use Cake\Database\Query;
use Cake\Database\Query\DeleteQuery;
use Cake\Database\Query\SelectQuery;
use Cake\Database\Query\UpdateQuery;
use Loxya\Config\Config;
use Loxya\Support\Filesystem\FilesystemFactory;
use Loxya\Support\Str;
use Phinx\Migration\AbstractMigration;

final class MoveUploadedFiles extends AbstractMigration
{
    public function up(): void
    {
        if (Config::getEnv() === 'test') {
            return;
        }

        $prefix = Config::get('db.prefix');
        $rootOldDirectory = sprintf('_old-%s', date('YmdHis'));
        $fs = FilesystemFactory::createLocalDriver([
            'root' => DATA_FOLDER . DS . 'materials',
        ]);

        // - Déplace les anciens dossiers vers un dossier `_old`.
        $oldDirectories = $fs->directories();
        foreach ($oldDirectories as $oldDirectory) {
            $fs->move($oldDirectory, $rootOldDirectory . DS . $oldDirectory);
        }

        // - Crée les nouveaux dossiers pour les images et documents du matériel.
        $fs->createDirectory('picture');
        $fs->createDirectory('documents');

        // - Récupère les images utilisées et les transferts dans le bon dossier.
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $materials = $qb
            ->select(['id', 'picture'])
            ->from(sprintf('%smaterials', $prefix))
            ->where(['NOT' => ['picture' => 'NULL']])
            ->execute()->fetchAll('assoc');

        if (!empty($materials)) {
            foreach ($materials as $material) {
                /** @var UpdateQuery $qb */
                $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
                $qb
                    ->update(sprintf('%smaterials', $prefix))
                    ->where(['id' => $material['id']]);

                $oldPath = $rootOldDirectory . DS . $material['id'] . DS . $material['picture'];
                if ($fs->fileExists($oldPath)) {
                    $extension = pathinfo($material['picture'], PATHINFO_EXTENSION);
                    $filename = sprintf('%s.%s', (string) Str::uuid(), $extension);
                    $fs->copy($oldPath, 'picture' . DS . $filename);
                    $qb->set('picture', $filename);
                } else {
                    $qb->set('picture', null);
                }

                $qb->execute();
            }
        }

        // - Récupère les documents utilisés et les transferts dans le bon dossier.
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $documents = $qb
            ->select(['id', 'material_id', 'name'])
            ->from(sprintf('%sdocuments', $prefix))
            ->execute()->fetchAll('assoc');

        if (!empty($documents)) {
            foreach ($documents as $document) {
                $oldPath = $rootOldDirectory . DS . $document['material_id'] . DS . $document['name'];
                if ($fs->fileExists($oldPath)) {
                    $fs->copy($oldPath, 'documents' . DS . $document['material_id'] . DS . $document['name']);
                } else {
                    /** @var DeleteQuery $qb */
                    $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
                    $qb
                        ->delete(sprintf('%sdocuments', $prefix))
                        ->where(['id' => $document['id']])
                        ->execute();
                }
            }
        }
    }

    public function down(): void
    {
        if (Config::getEnv() === 'test') {
            return;
        }

        $prefix = Config::get('db.prefix');
        $rootOldDirectory = sprintf('_old-%s', date('YmdHis'));
        $fs = FilesystemFactory::createLocalDriver([
            'root' => DATA_FOLDER . DS . 'materials',
        ]);

        // - Déplace les anciens dossiers vers un dossier `_old`.
        $oldDirectories = $fs->directories();
        foreach ($oldDirectories as $oldDirectory) {
            $fs->move($oldDirectory, $rootOldDirectory . DS . $oldDirectory);
        }

        // - Récupère les images utilisées et les transferts dans le bon dossier.
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $materials = $qb
            ->select(['id', 'picture'])
            ->from(sprintf('%smaterials', $prefix))
            ->where(['NOT' => ['picture' => 'NULL']])
            ->execute()->fetchAll('assoc');

        if (!empty($materials)) {
            foreach ($materials as $material) {
                $oldPath = $rootOldDirectory . DS . 'picture' . DS . $material['picture'];
                if ($fs->fileExists($oldPath)) {
                    $fs->copy($oldPath, $material['id'] . DS . $material['picture']);
                } else {
                    /** @var UpdateQuery $qb */
                    $qb = $this->getQueryBuilder(Query::TYPE_UPDATE);
                    $qb
                        ->update(sprintf('%smaterials', $prefix))
                        ->set('picture', null)
                        ->where(['id' => $material['id']])
                        ->execute();
                }
            }
        }

        // - Récupère les documents utilisés et les transferts dans le bon dossier.
        /** @var SelectQuery $qb */
        $qb = $this->getQueryBuilder(Query::TYPE_SELECT);
        $documents = $qb
            ->select(['id', 'material_id', 'name'])
            ->from(sprintf('%sdocuments', $prefix))
            ->execute()->fetchAll('assoc');

        if (!empty($documents)) {
            foreach ($documents as $document) {
                // phpcs:ignore Generic.Files.LineLength
                $oldPath = $rootOldDirectory . DS . 'documents' . DS . $document['material_id'] . DS . $document['name'];
                if ($fs->fileExists($oldPath)) {
                    $fs->copy($oldPath, $document['material_id'] . DS . $document['name']);
                } else {
                    /** @var DeleteQuery $qb */
                    $qb = $this->getQueryBuilder(Query::TYPE_DELETE);
                    $qb
                        ->delete(sprintf('%sdocuments', $prefix))
                        ->where(['id' => $document['id']])
                        ->execute();
                }
            }
        }
    }
}
