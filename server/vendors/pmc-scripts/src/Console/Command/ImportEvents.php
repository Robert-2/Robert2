<?php
declare(strict_types=1);

namespace PmcScripts\Console\Command;

use League\Csv\AbstractCsv;
use League\Csv\Reader;
use League\Csv\Statement;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

use Robert2\API\Models\Event;
use Robert2\API\Models\Person;
use Robert2\API\Models\Company;
use Robert2\API\Models\Material;

class ImportEvents extends Command
{
    public const IMPORT_USER_ID = 1;

    /** @var Event */
    private $Event;

    /** @var Person */
    private $Beneficiary;

    /** @var Company */
    private $Company;

    /** @var Material */
    private $Material;

    public function __construct(string $name = null)
    {
        parent::__construct($name);

        $this->Event = new Event;
        $this->Beneficiary = new Person;
        $this->Company = new Company;
        $this->Material = new Material;
    }

    protected function configure()
    {
        $this->setName('import-events')
            ->setDescription("[PMC Milliot] Importe les données des commandes Simax dans Robert2.")
            ->addArgument('input-file', InputArgument::REQUIRED, (
                "Le fichier CSV contenant les données de la table `commandes_erp` de Simax.\n" .
                "Ce fichier doit utiliser le format suivant:\n" .
                "- La première ligne doit contenir le nom des colonnes (\"id_cmd\", \"reference\", etc.).\n" .
                "- Virgules (,) pour les séparateurs de champ.\n" .
                "- Retour à la ligne unix (\\n) à la fin de chaque ligne.\n" .
                "- Double-guillemets (\") pour l'encapsulation des données de chaque champ.\n" .
                "- Antislash (\\) pour échapper les valeurs à l'intérieur des encapsulation de données."
            ));
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $file = $input->getArgument('input-file');

        $csv = $this->getCsv($file);
        $records = $this->getCsvRecords($csv);

        $recordsCount = count($records);
        if ($recordsCount === 0) {
            $output->writeln("<comment>Aucune commande à importer.</comment>");
            return;
        }

        $output->writeln(vsprintf(
            "Début de l'import de <info>%d commandes de type \"location\"</info> (sur %d au total) ...\n",
            [$recordsCount, count($csv)],
        ));

        $importedCount = 0;
        foreach ($records as $index => $record) {
            // - Reference
            $ref = $this->getOrderRef($record);
            if ($ref === null) {
                $output->getErrorOutput()->writeLn(sprintf(
                    "- La <comment>ligne %d</comment> n'a pas pu être importée: " .
                    "<fg=red;>Référence manquante ou invalide</fg=red;>.",
                    $index + 1
                ));
                continue;
            }

            $client = $this->getOrderClient($record);
            if (!$client) {
                $output->getErrorOutput()->writeLn(sprintf(
                    "- La commande ref. <comment>%s</comment> n'a pas pu être importée: " .
                    "<fg=red;>Les informations du client sont manquantes ou incomplètes.</fg=red;>.",
                    $ref
                ));
                continue;
            }

            $dates = $this->getOrderDates($record);
            if (!$dates || $dates['start'] === null || $dates['end'] === null) {
                $output->getErrorOutput()->writeLn(sprintf(
                    "- La commande ref. <comment>%s</comment> n'a pas pu être importée: " .
                    "<fg=red;>La date de début et de fin n'ont pas pu être traitées</fg=red;>.",
                    $ref
                ));
                continue;
            }

            $event = [
                'user_id' => self::IMPORT_USER_ID,
                'title' => $ref,
                'start_date' => $dates['start']->format('Y-m-d H:i:s'),
                'end_date' => $dates['end']->format('Y-m-d H:i:s'),
                'location' => $client['address']['full'],
                'is_confirmed' => true,
                'is_billable' => false
            ];

            // - companies (identifiant unique: email du contact)
            $company = [
                'legal_name' => $client['name'],
            ];

            // - persons (Beneficiaires) (identifiant unique: email du contact)
            $beneficiary = [
                'user_id' => null,
                'first_name' => $client['contact'],
                'last_name' => '--',
                'email' => $client['email'],
                // 'company_id' =>
                'street' => $client['address']['street'],
                'postal_code' => $client['address']['postalCode'],
                'locality' => $client['address']['locality'],
                // 'country' =>
            ];

            // - event_beneficiaries
            //   - event_id: Event créé plus haut.
            //   - person_id: Personne créer plus haut.
            $eventBeneficiaries = [];

            // - event_materials
            //   - event_id: Event créé plus haut.
            //   - material_id: (Découpe produits_commande) (ID unique: Le nom du produit)
            //   - quantity: (Découpe produits_commande)
            $materials = $this->getOrderMaterials($record);
            $eventMaterials = [];

            // TODO :)

            $importedCount++;
        }

        if ($importedCount >= $recordsCount) {
            $output->writeln("<info>Toutes les commandes ont été importées avec succés.</info>");
            return;
        }

        if ($importedCount === 0) {
            $output->writeln("\n<error>Aucune commande a pu être importée.</error>");
            return;
        }

        $output->writeln(vsprintf(
            "\n<comment>%d commandes ont pu être importées. L'import de %d autres a échoué.</comment>",
            [$importedCount, $recordsCount - $importedCount],
        ));
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    protected function getCsv($file)
    {
        if (!file_exists($file)) {
            throw new \InvalidArgumentException("Le fichier CSV spécifié est introuvable.");
        }

        try {
            $csv = Reader::createFromPath($file, 'r');
        } catch (League\Csv\Exception $e) {
            throw new \RuntimeException(
                sprintf("Le fichier CSV semble illisible.\nDétails: %s", $e->getMessage())
            );
        }

        // - Base configuration
        $csv->setDelimiter(',');
        $csv->setEnclosure('"');
        $csv->setEscape('\\');

        // - Header offset
        $csv->setHeaderOffset(0);

        return $csv;
    }

    protected function getCsvRecords(AbstractCsv $csv)
    {
        // - On ne porte attention qu'aux commandes de type "location".
        $filter = function ($record) {
            return (
                $record['location'] !== null &&
                in_array(strtolower($record['location']), ['1', 'oui', 'yes'], true)
            );
        };
        return (new Statement())->where($filter)->process($csv);
    }

    // ------------------------------------------------------
    // -
    // -    Parseurs
    // -
    // ------------------------------------------------------

    protected function getOrderRef($record)
    {
        if (empty($record['reference']) || substr(strtoupper($record['reference']), 0, 3) !== 'CMD') {
            return null;
        }
        return strtoupper($record['reference']);
    }

    protected function getOrderDates($record)
    {
        if (empty($record['commentaire_cmd'])) {
            return null;
        }

        // https://regex101.com/r/095Ese/2
        if (!preg_match('/location du (?<start>.*) au (?<end>.*)[.,]/iU', $record['commentaire_cmd'], $matches)) {
            return null;
        }

        $normalizeDate = function ($date, int $hour, int $minute, int $second = 0, \DateTime $fallbackDate = null) {
            // https://regex101.com/r/kH9dFT/3
            if (!preg_match('/(?<day>[0-9]{1,2})\/(?<month>[0-9]{1,2})(?:\/(?<year>[0-9]{4}|[0-9]{2}))?/', $date, $_matches)) {
                return null;
            }

            if (!isset($_matches['year']) && !$fallbackDate) {
                return null;
            }

            $year = $_matches['year'] ?? $fallbackDate->format('Y');
            $year = strlen($year) === 2 ? sprintf('20%s', $year) : $year;

            return (new \DateTime())
                ->setDate((int) $year, (int) $_matches['month'], (int) $_matches['day'])
                ->setTime($hour, $minute, $second);
        };

        $orderDate = !empty($record['date_cmd']) ? new \DateTime($record['date_cmd']) : null;
        $end = $normalizeDate($matches['end'], 23, 59, 59, $orderDate);
        if ($end) {
            $end->add(new \DateInterval('P3D'));
        }

        $start = $normalizeDate($matches['start'], 00, 00, 00, $end);
        if ($start) {
            $start->sub(new \DateInterval('P2D'));
        }

        return compact('start', 'end');
    }

    protected function getOrderClient($record)
    {
        $record['client'] = $record['client'] ? trim($record['client']) : null;
        $record['contact'] = $record['contact'] ? trim($record['contact']) : null;
        if (empty($record['client']) || empty($record['contact'])) {
            return null;
        }

        // - Email
        $isValidEmail = $this->Beneficiary->validation['email']->validate($record['email_contact']);
        if (empty($record['email_contact']) || !$isValidEmail) {
            return null;
        }

        // - Address
        $address = array_fill_keys(['recipient', 'street', 'postalCode', 'locality', 'country'], null);
        if (!empty($record['site'])) {
            $_address = explode('|', $record['site']);
            foreach (array_keys($address) as $index => $field) {
                $address[$field] = $_address[$index] ?? null;
                $address[$field] = rtrim(trim($address[$field]), ',. -');
            }
        }
        $address['full'] = implode(' | ', array_filter($address));
        $address['full'] = !empty($address['full']) ? $address['full'] : null;

        return [
            'name' => $record['client'],
            'email' => $record['email_contact'],
            'contact' => $record['contact'],
            'address' => $address,
        ];
    }

    protected function getOrderMaterials($record)
    {
        if (empty($record['produits_commande'])) {
            return null;
        }

        $split = function ($string, $char) {
            $splitted = preg_split(sprintf('/%1$s%1$s(?!%1$s)/', preg_quote($char, '/')), $string);
            return array_filter($splitted);
        };
        [$materials, $quantities] = $split($record['produits_commande'], '&');

        // - Materials
        $materials = array_map(
            function ($material) {
                return preg_replace('/^[A-Z] /', '', trim($material));
            },
            $split($materials, '+')
        );
        $materialsCount = count($materials);
        if (!$materialsCount) {
            return null;
        }

        // - Quantities
        $quantities = $quantities ? $split($quantities, '+') : [];
        foreach ($quantities as $index => $quantity) {
            $isInteger = preg_match('/^(?<quantity>[0-9]+)(?:[,.]0+)?$/', trim($quantity), $matches);
            if (!$isInteger) {
                return null;
            }
            $quantities[$index] = (int) $matches['quantity'];
        }

        if (!empty($quantities) && $materialsCount !== count($quantities)) {
            return null;
        }

        if (empty($quantities)) {
            $quantities = array_fill(0, $materialsCount, 1);
        }

        // - Group results ...
        $results = [];
        $materialIndexer = [];
        foreach ($materials as $index => $name) {
            $quantity = $quantities[$index];

            $normalizedName = strtolower($name);
            if (array_key_exists($normalizedName, $materialIndexer)) {
                $results[$materialIndexer[$normalizedName]] += $quantity;
                continue;
            }

            $results[$name] = $quantity;
            $materialIndexer[$normalizedName] = $name;
        }

        return $results;
    }
}
