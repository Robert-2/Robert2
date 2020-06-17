<?php
declare(strict_types=1);

namespace Robert2\Tests;

use Robert2\Scripts\ImportsV1\Processors;
use Robert2\API\Errors\ValidationException;

final class ImportsTest extends ModelTestCase
{
    public function testMaterialsProcessor()
    {
        $processor = new Processors\Materials;

        // - Import empty data
        $processor->import([]);
        $this->assertEquals(0, $processor->count);

        // - Import one material
        $data = [
            [
                'id'        => '1',
                'label'     => 'Retour Martin Audio LE400',
                'ref'       => 'LE400',
                'panne'     => '0',
                'externe'   => '0',
                'categorie' => 'son',
                'sousCateg' => '2',
                'Qtotale'   => '12',
                'tarifLoc'  => '15',
                'valRemp'   => '600',
                'dateAchat' => null,
                'ownerExt'  => 'test',
                'remarque'  => "Testing materials",
            ],
        ];
        $processor->import($data);
        $this->assertEquals(1, $processor->count);

        // - Fail with validation error
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $data[0]['ref'] = 'No, no punctuation!!';
        $processor->import($data);
    }

    public function testTechniciansProcessor()
    {
        $processor = new Processors\Technicians;

        // - Import empty data
        $processor->import([]);
        $this->assertEquals(0, $processor->count);

        // - Import one technician
        $data = [
            [
                'id'              => '1',
                'idUser'          => '10',
                'surnom'          => 'Testing',
                'nom'             => 'Tester',
                'prenom'          => 'Essay',
                'email'           => 'essay@testing.com',
                'tel'             => '0123456789',
                'GUSO'            => '1212121212',
                'CS'              => 'P 123 123',
                'birthDay'        => '1982-02-28',
                'birthPlace'      => 'Marseille',
                'habilitations'   => 'undefined',
                'categorie'       => 'polyvalent',
                'SECU'            => '18202000000000',
                'SIRET'           => 'N/A',
                'assedic'         => '123123X',
                'intermittent'    => '1',
                'adresse'         => 'Testing street',
                'cp'              => '01234',
                'ville'           => 'Tests land',
                'diplomes_folder' => 'testing',
            ],
        ];
        $processor->import($data);
        $this->assertEquals(1, $processor->count);

        // - Fail with validation error
        $this->expectException(ValidationException::class);
        $this->expectExceptionCode(ERROR_VALIDATION);
        $data[0]['prenom'] = '';
        $processor->import($data);
    }
}
