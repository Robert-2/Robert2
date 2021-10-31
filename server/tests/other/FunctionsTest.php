<?php
declare(strict_types=1);

namespace Robert2\Tests;

use PHPUnit\Framework\TestCase;
use Slim\Psr7\UploadedFile;

final class FunctionsTest extends TestCase
{
    public function testGetExecutionTime(): void
    {
        $this->assertNotEmpty(getExecutionTime());
    }

    public function testSnakeToCamelCase(): void
    {
        $this->assertEquals('unTest', snakeToCamelCase('un_test'));
        $this->assertEquals('SecondTest', snakeToCamelCase('second_test', true));
    }

    public function testSnakeCase(): void
    {
        $this->assertEquals('un_test', snakeCase("un_test"));
        $this->assertEquals('un_test', snakeCase("Un test"));
        $this->assertEquals('un_test', snakeCase("UnTest"));
        $this->assertEquals('un_test', snakeCase("unTest"));
    }

    public function testSlugify(): void
    {
        $this->assertEquals('un_test', slugify("un test"));
        $this->assertEquals('test_espace_insécable', slugify("test espace insécable"));
    }

    public function testCleanEmptyFields(): void
    {
        $data = ['field1' => 'not-empty', 'field2' => '', 'field3' => null];
        $result = cleanEmptyFields($data);
        $expected = ['field1' => 'not-empty', 'field2' => null, 'field3' => null];
        $this->assertEquals($expected, $result);
    }

    public function testNormalizePhone(): void
    {
        $result = normalizePhone('01 23 45 67 89');
        $this->assertEquals('0123456789', $result);
    }

    public function testSplitPeriods(): void
    {
        $exec = function ($sets) {
            $data = array_map(
                function ($dates) {
                    return ['start_date' => $dates[0], 'end_date' => $dates[1]];
                },
                $sets
            );
            return splitPeriods($data);
        };

        // - La fonction doit retourner un tableau vide s'il n'y a pas d'intervalle (= une seule date).
        $this->assertSame([], $exec([
            ['2020-01-01 00:00', '2020-01-01 00:00'],
            ['2020-01-01 00:00', '2020-01-01 00:00']
        ]));

        // - La fonction doit auto-compléter les heures si elles ne sont pas fournies.
        $this->assertSame(
            [['2020-01-01 00:00', '2020-12-31 23:59']],
            $exec([['2020-01-01', '2020-12-31']])
        );

        // - La fonction doit retourner les intervalles pour les dates données.
        $expected = [
            ['2019-07-15 00:00', '2019-07-15 23:59'],
            ['2019-07-15 23:59', '2020-01-01 00:00'],
            ['2020-01-01 00:00', '2020-01-05 00:00'],
            ['2020-01-05 00:00', '2020-01-20 23:59'],
            ['2020-01-20 23:59', '2020-01-30 23:59'],
            ['2020-01-30 23:59', '2021-05-04 00:00'],
            ['2021-05-04 00:00', '2021-10-01 23:59'],
        ];
        $this->assertSame($expected, $exec([
            ['2020-01-05', '2020-01-20'],
            ['2020-01-01', '2020-01-30'],
            ['2019-07-15', '2019-07-15'],
            ['2021-05-04', '2021-10-01'],
        ]));

        // - La fonction doit aussi accépter les `Datetime`.
        $expected = [
            ['2020-01-01 00:00', '2020-06-01 12:00'],
            ['2020-06-01 12:00', '2020-06-30 22:00'],
            ['2020-06-30 22:00', '2020-12-31 23:59'],
        ];
        $this->assertSame($expected, $exec([
            [new \DateTime('2020-01-01 00:00'), new \DateTime('2020-12-31 23:59')],
            [new \DateTime('2020-06-01 12:00'), new \DateTime('2020-06-30 22:00')],
        ]));

        // - La fonction doit lever une exception si une des dates fournies est invalide.
        $this->expectException(\InvalidArgumentException::class);
        $exec([['INVALID-DATE', '2020-12-31']]);
    }

    public function testMoveUploadedFile(): void
    {
        $sourceFile = DATA_FOLDER . DS . 'tmp' . DS . 'upload_file.pdf';
        $destinationFolder = DATA_FOLDER . DS . 'materials' . DS . 'tests';

        // - Déplace le fichier de test d'upload dans
        $file = new UploadedFile($sourceFile, 'Uploaded File for Tests.pdf', 'application/pdf', 13269);
        // - Déplace le fichier de test d'upload dans le dossier d'un matériel
        $filename = moveUploadedFile($destinationFolder, $file);
        $this->assertEquals('Uploaded-File-for-Tests.pdf', $filename);
        $destinationFile = $destinationFolder . DS . $filename;
        $this->assertTrue(file_exists($destinationFile));
        // - Remet le fichier dans son dossier d'origine
        rename($destinationFile, $sourceFile);
        $this->assertTrue(file_exists($sourceFile));
    }

    public function testRoundDate(): void
    {
        // - Tests avec une précision de 15 minutes
        $dateTests = [
            '2021-09-01 10:05' => '2021-09-01 10:00',
            '2021-09-01 10:08' => '2021-09-01 10:15',
            '2021-09-01 10:28' => '2021-09-01 10:30',
            '2021-09-01 10:36' => '2021-09-01 10:30',
            '2021-09-01 10:42' => '2021-09-01 10:45',
            '2021-09-01 10:51' => '2021-09-01 10:45',
            '2021-09-01 10:57' => '2021-09-01 11:00',
            '2021-09-01 23:58' => '2021-09-02 00:00',
            '2021-09-02 00:01' => '2021-09-02 00:00',
        ];
        foreach ($dateTests as $dateTest => $expected) {
            $date = new \DateTime($dateTest);
            $result = roundDate($date)->format('Y-m-d H:i');
            $this->assertEquals($expected, $result);
        }

        // - Tests avec une précision de 30 minutes
        $dateTests = [
            '2021-09-01 10:05' => '2021-09-01 10:00',
            '2021-09-01 10:08' => '2021-09-01 10:00',
            '2021-09-01 10:18' => '2021-09-01 10:30',
            '2021-09-01 10:36' => '2021-09-01 10:30',
            '2021-09-01 10:42' => '2021-09-01 10:30',
            '2021-09-01 10:51' => '2021-09-01 11:00',
            '2021-09-01 10:57' => '2021-09-01 11:00',
            '2021-09-01 23:58' => '2021-09-02 00:00',
            '2021-09-02 00:01' => '2021-09-02 00:00',
        ];
        foreach ($dateTests as $dateTest => $expected) {
            $date = new \DateTime($dateTest);
            $result = roundDate($date, 30)->format('Y-m-d H:i');
            $this->assertEquals($expected, $result);
        }
    }
}
