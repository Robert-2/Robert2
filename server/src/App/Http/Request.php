<?php
declare(strict_types=1);

namespace Loxya\Http;

use BackedEnum;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;
use DateTimeZone;
use Loxya\Config\Config;
use Loxya\Http\Enums\AppContext;
use Loxya\Models\BaseModel;
use Loxya\Support\Assert;
use Loxya\Support\Period;
use Slim\Http\ServerRequest as CoreRequest;

class Request extends CoreRequest
{
    /**
     * Retourne le contexte de la requête.
     *
     * @return AppContext Le contexte de la requête.
     */
    public function getContext(): AppContext
    {
        return AppContext::INTERNAL;
    }

    /**
     * La requête est t'elle à destination de l'API ?
     *
     * @return bool `true` si c'est une requête d'API, `false` sinon.
     */
    public function isApi(): bool
    {
        return $this->match('/api');
    }

    /**
     * La requête est t'elle dans le context fourni ?
     *
     * @param AppContext $context Le contexte à vérifier.
     *
     * @return bool `true` si on est dans le contexte, `false` sinon.
     */
    public function isInContext(AppContext $context): bool
    {
        return $this->getContext() === $context;
    }

    /**
     * Permet de vérifier si le chemin de la requête courante correspond au(x) chemin(s) passés.
     *
     * @param array|string $paths - Le ou les chemins à vérifier.
     *                              Si c'est un tableau, le chemin courant doit correspondre à
     *                              au moins une des entrées. Ce tableau peut contenir une liste
     *                              d'URL simples ou bien contenir en clé l'URL et en valeur des
     *                              méthodes requises pour que l'URL soit considérée comme
     *                              correspondante.
     *
     * @return bool `true` si la requête correspond, `false` sinon.
     */
    public function match(string|array $paths): bool
    {
        $requestMethod = $this->getMethod();
        $requestPath = str_replace('//', '/', sprintf('/%s', $this->getUri()->getPath()));

        foreach ((array) $paths as $path => $methods) {
            if (is_numeric($path)) {
                $path = $methods;
                $methods = null;
            }

            $path = rtrim(Config::getBaseUri()->withPath($path)->getPath(), '/');
            $isUriMatching = (bool) preg_match(sprintf('@^%s(?:/|$)@', preg_quote($path, '@')), $requestPath);
            $isMethodMatching = $methods === null || in_array($requestMethod, (array) $methods, true);

            if ($isUriMatching && $isMethodMatching) {
                return true;
            }
        }

        return false;
    }

    /**
     * Retrieve attribute as an integer value.
     *
     * @param string $key The key in which the attribute to retrieve is located.
     *
     * @return int The attribute as an integer value.
     */
    public function getIntegerAttribute(string $key): int
    {
        $rawValue = $this->getAttribute($key, null);
        if ($rawValue === null) {
            throw new \LogicException(sprintf('Unexpected unknown integer attribute `%s`.', $key));
        }
        return intval($rawValue);
    }

    /**
     * Retrieve query parameter as a boolean value.
     *
     * Returns `true` when value is "1", "true", "on", and "yes". Otherwise, returns `false`.
     *
     * @template D of bool|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return bool|D The boolean valu(or `null` if its the default value).
     */
    public function getBooleanQueryParam(string $key, bool|null $default = false): bool|null
    {
        $rawValue = $this->getQueryParam($key, null);

        return $rawValue !== null
            ? filter_var($rawValue, FILTER_VALIDATE_BOOLEAN)
            : $default;
    }

    /**
     * Retrieve query parameter as a string (or `null` if its the default value).
     *
     * @template D of string|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return string|D The resulting string (or `null` if its the default value).
     */
    public function getStringQueryParam(string $key, string|null $default = null): string|null
    {
        $rawValue = $this->getQueryParam($key, null);
        return $rawValue !== null ? trim((string) $rawValue) : $default;
    }

    /**
     * Retrieve query parameter as an integer value (or `null` if its the default value).
     *
     * @template D of int|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return int|D The integer value (or `null` if its the default value).
     */
    public function getIntegerQueryParam(string $key, int|null $default = null): int|null
    {
        $rawValue = $this->getQueryParam($key, null);
        return $rawValue !== null ? intval($rawValue) : $default;
    }

    /**
     * Retrieve query parameter as a date (or `null` if its the default value).
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param string|DateTimeInterface|null $default The default value if the parameter does not exist.
     * @param DateTimeZone|string|null $tz The timezone to use for the value / default value.
     *
     * @return CarbonInterface|null The date (or `null` if its the default value).
     */
    public function getDateQueryParam(
        string $key,
        string|DateTimeInterface|null $default = null,
        DateTimeZone|string|null $tz = null,
    ): CarbonInterface|null {
        $rawValue = $this->getQueryParam($key, null);
        if ($rawValue !== null) {
            try {
                return Carbon::parse($rawValue, $tz);
            } catch (\Throwable) {
                // - Default value.
            }
        }
        return $default !== null ? Carbon::parse($default, $tz) : null;
    }

    /**
     * Retrieve query parameter as a period (or `null` if its the default value).
     *
     * @template D of Period|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return Period|D The period (or `null` if its the default value).
     */
    public function getPeriodQueryParam(string $key, Period|null $default = null): Period|null
    {
        $rawValue = $this->getQueryParam($key, null);
        if ($rawValue !== null && is_array($rawValue)) {
            try {
                return Period::fromArray($rawValue);
            } catch (\Throwable) {
                // - Default value.
            }
        }
        return $default !== null ? new Period($default) : null;
    }

    /**
     * Retrieve query parameter as a raw enum value (or `null` if its the default value).
     * A raw enum value is a valid value from a list of given values.
     *
     * @template T of mixed
     * @template D of mixed|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param T[] $enum The raw enum valid values.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return T|D The raw enum value (or `null` if its the default value).
     */
    public function getRawEnumQueryParam(string $key, array $enum, mixed $default = null): mixed
    {
        Assert::nullOrInArray($default, $enum, 'Default value should be present in enum values (or `null`).');

        $rawValue = $this->getQueryParam($key, null);
        return in_array($rawValue, $enum, true) ? $rawValue : $default;
    }

    /**
     * Retrieve query parameter as an enum value (or `null` if its the default value).
     *
     * @template T of BackedEnum
     * @template D of BackedEnum|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param class-string<T> $enumClass The enum class.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return T|D The enum value (or `null` if its the default value).
     */
    public function getEnumQueryParam(string $key, string $enumClass, BackedEnum|null $default = null): BackedEnum|null
    {
        Assert::enumExists($enumClass, 'Unknown enum class `%s`.');
        Assert::isAOf($enumClass, BackedEnum::class, 'Enum class should be a backed enum.');
        Assert::nullOrIsInstanceOf($default, $enumClass, 'Default value should be a member of the enum (or `null`).');

        $rawValue = $this->getQueryParam($key, null);
        if ($rawValue === null) {
            return $default;
        }

        return $enumClass::tryFrom($rawValue) ?? $default;
    }

    /**
     * Retrieve query parameter as an `order by` valid value for a specific model.
     *
     * IF the query parameter value is invalid, a call to `getDefaultOrderColumn()`
     * on the specified model will be done and the returned value will be used as default.
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param string $modelClass The model for which the `order byù column should be retrieved.
     *
     * @return string|null The name of the column (or `null` if its the default returned by the model).
     */
    public function getOrderByQueryParam(string $key, string $modelClass): string|null
    {
        Assert::isAOf($modelClass, BaseModel::class, 'Model class should be a model class.');

        /** @var BaseModel $model */
        $model = (new $modelClass());
        $orderableColumns = $model->getOrderableColumns();
        $defaultOrderColumn = $model->getDefaultOrderColumn();

        $rawValue = $this->getQueryParam($key, null);
        if ($rawValue === null) {
            return $defaultOrderColumn;
        }

        return in_array($rawValue, $orderableColumns, true) ? $rawValue : $defaultOrderColumn;
    }

    /**
     * Retrieve body parameter as a raw enum value (or `null` if its the default value).
     * A raw enum value is a valid value from a list of given values.
     *
     * @template T of mixed
     * @template D of mixed|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param T[] $enum The raw enum valid values.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return T|D The raw enum value (or `null` if its the default value).
     */
    public function getRawEnumBodyParam(string $key, array $enum, mixed $default = null): mixed
    {
        Assert::nullOrInArray($default, $enum, 'Default value should be present in enum values (or `null`).');

        $rawValue = $this->getParsedBodyParam($key, null);
        if ($rawValue === null) {
            return $default;
        }

        return in_array($rawValue, $enum, true) ? $rawValue : $default;
    }

    /**
     * Retrieve body parameter as an enum value (or `null` if its the default value).
     *
     * @template T of BackedEnum
     * @template D of BackedEnum|null
     *
     * @param string $key The key in which the parameter to retrieve is located.
     * @param class-string<T> $enumClass The enum class.
     * @param D $default The default value if the parameter does not exist.
     *
     * @return T|D The enum value (or `null` if its the default value).
     */
    public function getEnumBodyParam(string $key, string $enumClass, BackedEnum|null $default = null): BackedEnum|null
    {
        Assert::enumExists($enumClass, 'Unknown enum class `%s`.');
        Assert::isAOf($enumClass, BackedEnum::class, 'Enum class should be a backed enum.');
        Assert::nullOrIsInstanceOf($default, $enumClass, 'Default value should be a member of the enum (or `null`).');

        $rawValue = $this->getParsedBodyParam($key, null);
        if ($rawValue === null) {
            return $default;
        }

        return $enumClass::tryFrom($rawValue) ?? $default;
    }
}
