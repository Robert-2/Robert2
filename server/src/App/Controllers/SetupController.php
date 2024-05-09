<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use DI\Container;
use Loxya\Config\Config;
use Loxya\Errors\Exception\ValidationException;
use Loxya\Http\Request;
use Loxya\Install\Install;
use Loxya\Models\Category;
use Loxya\Models\Enums\Group;
use Loxya\Models\User;
use Loxya\Services\I18n;
use Loxya\Services\View;
use Psr\Http\Message\ResponseInterface;
use Slim\Http\Response;

final class SetupController extends BaseController
{
    private View $view;

    private I18n $i18n;

    public function __construct(Container $container, View $view, I18n $i18n)
    {
        parent::__construct($container);

        $this->view = $view;
        $this->i18n = $i18n;
    }

    public function index(Request $request, Response $response): ResponseInterface
    {
        $currentStep = Install::getStep();
        if ($currentStep === 'end') {
            return $response->withRedirect('/login');
        }

        $stepData = [];
        $error = false;
        $validationErrors = null;

        $lang = $this->i18n->getLanguage();
        $allCurrencies = Install::getAllCurrencies();

        if ($request->isGet()) {
            if ($currentStep === 'welcome') {
                return $this->view->render(
                    $response,
                    'install.twig',
                    $this->_getCheckRequirementsData() + ['lang' => $lang],
                );
            }

            if ($currentStep === 'company') {
                $stepData = Config::get('companyData');
            }
        }

        if ($request->isPost()) {
            $installData = $request->getParsedBody();

            $stepSkipped = (
                array_key_exists('skipped', $installData)
                && $installData['skipped'] === 'yes'
            );
            if ($stepSkipped) {
                $installData['skipped'] = true;
            }

            if ($currentStep === 'settings') {
                $installData['currency'] = $allCurrencies[$installData['currency']];

                // - Pré-remplissage des données spécifiques à la Premium qui ne sont pas demandées
                //   dans le wizard d'installation avec les valeurs par défaut, afin de les avoir
                //   sous la main dans le fichier settings.json, le jour où on veut les renseigner.
                foreach (['handScanner', 'email', 'notifications'] as $premiumSetting) {
                    $installData[$premiumSetting] = Config::DEFAULT_SETTINGS[$premiumSetting];
                }
            }

            if ($currentStep === 'company') {
                $installData['logo'] = null;
                ksort($installData);
            }

            try {
                Install::setInstallProgress($currentStep, $installData);

                if ($currentStep === 'company') {
                    $this->_validateCompanyData($installData);
                }

                if ($currentStep === 'database') {
                    $settings = Install::getSettingsFromInstallData();
                    Config::saveCustomConfig($settings);
                    Config::getPDO(); // - Try to connect to DB
                }

                if ($currentStep === 'dbStructure') {
                    Install::migrateDatabase();
                }

                if ($currentStep === 'adminUser') {
                    if ($stepSkipped && !User::where('group', Group::ADMIN)->exists()) {
                        throw new \InvalidArgumentException(
                            "At least one user must exists. Please create an administrator.",
                        );
                    }

                    if (!$stepSkipped) {
                        $installData['user']['group'] = Group::ADMIN;
                        User::new($installData['user']);
                    }
                }

                if ($currentStep === 'categories') {
                    $categories = explode(',', $installData['categories']);
                    Category::bulkAdd(array_unique($categories));
                }

                return $response->withRedirect('/install');
            } catch (\Throwable $e) {
                Install::setInstallProgress($currentStep);

                $stepData = $installData;
                $error = $e->getMessage();
                if ($e instanceof ValidationException) {
                    $error = "validationErrors";
                    $validationErrors = $e->getValidationErrors();
                }

                if ($currentStep === 'database') {
                    Config::deleteCustomConfig();
                }
            }
        }

        if ($currentStep === 'coreSettings' && empty($stepData['JWTSecret'])) {
            $stepData['JWTSecret'] = md5(uniqid('Loxya', true));
        }

        if ($currentStep === 'settings') {
            $stepData['currencies'] = $allCurrencies;
        }

        if ($currentStep === 'dbStructure') {
            try {
                $stepData = [
                    'migrationStatus' => Install::getMigrationsStatus(),
                    'canProcess' => true,
                ];
            } catch (\Throwable $e) {
                $stepData = [
                    'migrationStatus' => [],
                    'errorCode' => $e->getCode(),
                    'error' => $e->getMessage(),
                    'canProcess' => false,
                ];
            }
        }

        if ($currentStep === 'adminUser') {
            $stepData['existingAdmins'] = User::where('group', Group::ADMIN)->get()->toArray();
        }

        // - Données de configuration existantes.
        $config = array_replace(Config::get(), [
            'baseUrl' => Config::getBaseUrl(),
        ]);

        return $this->view->render($response, 'install.twig', [
            'lang' => $lang,
            'step' => $currentStep,
            'stepNumber' => array_search($currentStep, Install::INSTALL_STEPS),
            'error' => $error,
            'validationErrors' => $validationErrors,
            'stepData' => $stepData,
            'config' => $config,
        ]);
    }

    public function endInstall(Request $request, Response $response): ResponseInterface
    {
        $steps = Install::INSTALL_STEPS;

        $endStep = end($steps);
        $prevStep = prev($steps);

        Install::setInstallProgress($prevStep, ['skipped' => true]);
        Install::setInstallProgress($endStep, []);

        return $response->withRedirect('/login');
    }

    // ------------------------------------------------------
    // -
    // -    Méthodes internes
    // -
    // ------------------------------------------------------

    private function _getCheckRequirementsData(): array
    {
        $phpVersion = PHP_VERSION;
        if (str_contains(PHP_VERSION, '+')) {
            $phpVersion = substr(PHP_VERSION, 0, strpos(PHP_VERSION, '+'));
        }

        $phpVersionMin = Install::MIN_PHP_VERSION;
        $phpVersionMax = Install::MAX_PHP_VERSION;
        $neededExtensions = Install::REQUIRED_EXTENSIONS;

        $loadedExtensions = get_loaded_extensions();
        $phpversionIsAboveMin = version_compare(PHP_VERSION, $phpVersionMin, '>=');
        $phpversionIsAboveMax = version_compare(
            // - Réduit la version de PHP courante à la même précision que la contrainte max.
            //   (e.g. Version de PHP : `8.3.4` / Contrainte : `8.4` => `8.3`)
            implode('.', array_slice(
                explode('.', $phpVersion),
                0,
                count(explode('.', $phpVersionMax)),
            )),
            $phpVersionMax,
            '>',
        );

        $missingExtensions = array_diff($neededExtensions, $loadedExtensions);

        return [
            'step' => 'welcome',
            'phpVersion' => $phpVersion,
            'phpVersionMin' => $phpVersionMin,
            'phpVersionMax' => $phpVersionMax,
            'phpversionIsAboveMin' => $phpversionIsAboveMin,
            'phpversionIsAboveMax' => $phpversionIsAboveMax,
            'missingExtensions' => $missingExtensions,
        ];
    }

    private function _validateCompanyData($companyData): void
    {
        $errors = [];
        foreach (['name', 'street', 'zipCode', 'locality'] as $mandatoryField) {
            if (empty($companyData[$mandatoryField])) {
                $errors[$mandatoryField] = 'mandatory-field';
                continue;
            }
        }

        if (empty($errors)) {
            return;
        }

        throw new ValidationException($errors);
    }
}
