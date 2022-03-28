<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use DI\Container;
use Robert2\API\Config\Config;
use Robert2\API\Errors\ValidationException;
use Robert2\API\Models\Category;
use Robert2\API\Models\User;
use Robert2\API\Services\I18n;
use Robert2\API\Services\View;
use Robert2\Install\Install;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;

class SetupController extends BaseController
{
    /** @var View */
    private $view;

    /** @var I18n */
    private $i18n;

    /** @var array */
    private $settings;

    public function __construct(Container $container, View $view, I18n $i18n)
    {
        parent::__construct($container);

        $this->view = $view;
        $this->i18n = $i18n;
        $this->settings = $container->get('settings');
    }

    public function index(Request $request, Response $response)
    {
        $installProgress = Install::getInstallProgress();
        $currentStep = $installProgress['step'];
        $stepData = [];
        $error = false;
        $validationErrors = null;

        $lang = $this->i18n->getCurrentLocale();
        $allCurrencies = Install::getAllCurrencies();

        if ($request->isGet() && $currentStep === 'welcome') {
            return $this->view->render(
                $response,
                'install.twig',
                $this->_getCheckRequirementsData() + ['lang' => $lang]
            );
        }

        if ($request->isPost()) {
            $installData = $request->getParsedBody();

            if ($currentStep === 'settings') {
                $installData['currency'] = $allCurrencies[$installData['currency']];
            }

            if ($currentStep === 'company') {
                $installData['logo'] = null;
                ksort($installData);
            }

            $stepSkipped = array_key_exists('skipped', $installData) && $installData['skipped'] === 'yes';
            if ($stepSkipped) {
                $installData['skipped'] = true;
            }

            try {
                $installProgress = Install::setInstallProgress($currentStep, $installData);

                if ($currentStep === 'company') {
                    $this->_validateCompanyData($installData);
                }

                if ($currentStep === 'database') {
                    $settings = Install::getSettingsFromInstallData();
                    Config::saveCustomConfig($settings, true);
                    Config::getPDO(); // - Try to connect to DB
                }

                if ($currentStep === 'dbStructure') {
                    Install::createMissingTables();
                    Install::insertInitialDataIntoDB();
                }

                if ($currentStep === 'adminUser') {
                    if ($stepSkipped && !User::where('group_id', 'admin')->exists()) {
                        throw new \InvalidArgumentException(
                            "At least one user must exists. Please create an admin user."
                        );
                    }

                    if (!$stepSkipped) {
                        $installData['user']['group_id'] = 'admin';
                        $user = new User();
                        $user->edit(null, $installData['user']);
                    }
                }

                if ($currentStep === 'categories') {
                    $categories = explode(',', $installData['categories']);
                    $Category = new Category();
                    $Category->bulkAdd(array_unique($categories));
                }
            } catch (\Exception $e) {
                $installProgress = Install::setInstallProgress($currentStep);

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

        if ($installProgress['step'] === 'coreSettings' && empty($stepData['JWTSecret'])) {
            $stepData['JWTSecret'] = md5(uniqid('Robert2', true));
        }

        if ($installProgress['step'] === 'settings') {
            $stepData['currencies'] = $allCurrencies;
        }

        if ($installProgress['step'] === 'dbStructure') {
            try {
                $stepData = [
                    'migrationStatus' => Install::getMigrationsStatus(),
                    'canProcess' => true
                ];
            } catch (\Exception $e) {
                $stepData = [
                    'migrationStatus' => [],
                    'errorCode' => $e->getCode(),
                    'error' => $e->getMessage(),
                    'canProcess' => false
                ];
            }
        }

        if ($installProgress['step'] === 'adminUser') {
            $stepData['existingAdmins'] = User::where('group_id', 'admin')->get()->toArray();
        }

        return $this->view->render($response, 'install.twig', [
            'lang' => $lang,
            'step' => $installProgress['step'],
            'stepNumber' => array_search($installProgress['step'], Install::INSTALL_STEPS),
            'error' => $error,
            'validationErrors' => $validationErrors,
            'stepData' => $stepData,
            'config' => $this->settings,
        ]);
    }

    public function endInstall(Request $request, Response $response)
    {
        $steps = Install::INSTALL_STEPS;

        $endStep = end($steps);
        $prevStep = prev($steps);

        Install::setInstallProgress($prevStep, ['skipped' => true]);
        Install::setInstallProgress($endStep, []);

        return $response
            ->withHeader('Location', '/login')
            ->withStatus(302);
    }

    // ------------------------------------------------------
    // -
    // -    Internal methods
    // -
    // ------------------------------------------------------

    private function _getCheckRequirementsData(): array
    {
        $phpVersion = PHP_VERSION;
        if (strpos(PHP_VERSION, '+')) {
            $phpVersion = substr(PHP_VERSION, 0, strpos(PHP_VERSION, '+'));
        }

        $phpversionOK = version_compare(PHP_VERSION, '7.4.0') >= 0;
        $loadedExtensions = get_loaded_extensions();
        $neededExstensions = Install::REQUIRED_EXTENSIONS;
        $missingExtensions = array_diff($neededExstensions, $loadedExtensions);

        return [
            'step' => 'welcome',
            'phpVersion' => $phpVersion,
            'phpVersionOK' => $phpversionOK,
            'missingExtensions' => $missingExtensions,
            'requirementsOK' => $phpversionOK && empty($missingExtensions),
        ];
    }

    private function _validateCompanyData($companyData): void
    {
        $errors = [];
        foreach (['name', 'street', 'zipCode', 'locality'] as $mandatoryfield) {
            if (empty($companyData[$mandatoryfield])) {
                $errors[$mandatoryfield] = "Missing value";
                continue;
            }
        }

        if (empty($errors)) {
            return;
        }

        throw (new ValidationException)
            ->setValidationErrors($errors);
    }
}
