<?php
declare(strict_types=1);

namespace Robert2\Scripts\ImportV1\Processors;

use Robert2\Scripts\ImportV1\Processor;
use Robert2\API\Models\Person;
use Robert2\API\Config;

class Technicians extends Processor
{
    public $autoFieldsMap = [
        'id'              => null,
        'idUser'          => null,
        'surnom'          => ['type' => 'string', 'field' => 'nickname'],
        'nom'             => ['type' => 'string', 'field' => 'last_name'],
        'prenom'          => ['type' => 'string', 'field' => 'first_name'],
        'email'           => ['type' => 'string', 'field' => 'email'],
        'tel'             => ['type' => 'string', 'field' => 'phone'],
        'GUSO'            => null,
        'CS'              => null,
        'birthDay'        => null,
        'birthPlace'      => null,
        'habilitations'   => null,
        'categorie'       => null,
        'SECU'            => null,
        'SIRET'           => null,
        'assedic'         => null,
        'intermittent'    => null,
        'adresse'         => ['type' => 'string', 'field' => 'street'],
        'cp'              => ['type' => 'string', 'field' => 'postal_code'],
        'ville'           => ['type' => 'string', 'field' => 'locality'],
        'diplomes_folder' => null,

        // Added in _preProcess method
        'notes' => ['type' => 'string', 'field' => 'note'],
        'tags'  => ['type' => 'array', 'field' => 'tags'],
    ];

    public function __construct()
    {
        $this->model = new Person;
    }

    // ------------------------------------------------------
    // -
    // -    Specific Methods
    // -
    // ------------------------------------------------------

    protected function _preProcess(array $data): array
    {
        return array_map(function ($item) {
            $extraData = [
                'SECU'            => "N° de Sécurité Sociale",
                'GUSO'            => "N° GUSO",
                'CS'              => "N° Congés Spectacle",
                'assedic'         => "N° Pôle Emploi",
                'birthDay'        => "Date de naissance",
                'birthPlace'      => "Lieu de naissance",
                'habilitations'   => "Habilitations",
                'categorie'       => "Compétences",
                'intermittent'    => "Est intermittent",
                'SIRET'           => "N° SIRET",
            ];
            $notes = [];
            foreach ($extraData as $field => $info) {
                $value = $item[$field];
                $emptyValues = [null, '', 'N/A', 'undefined'];
                if (!in_array($value, $emptyValues)) {
                    if ($field === 'intermittent') {
                        $value = $value === '1' ? 'Oui' : 'Non';
                    }
                    $notes[] = sprintf('%s : %s', $info, $value);
                }
            }
            $item['notes'] = implode("\n", $notes);

            $tagsConfig = Config\Config::getSettings('defaultTags');
            $item['tags'] = [$tagsConfig['technician']];

            return $item;
        }, $data);
    }
}
