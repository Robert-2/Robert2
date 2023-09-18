<?php
declare(strict_types=1);

namespace Loxya\Controllers;

use Carbon\Carbon;
use Eluceo\iCal\Domain\Entity\Calendar as Calendar;
use Eluceo\iCal\Domain\Entity\Event as CalendarEvent;
use Eluceo\iCal\Domain\Entity\TimeZone as CalendarTimeZone;
use Eluceo\iCal\Domain\ValueObject as CalendarValue;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Loxya\Config\Config;
use Loxya\Http\Request;
use Loxya\Models\Event;
use Loxya\Models\Setting;
use Psr\Http\Message\ResponseInterface;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Psr7\Factory\StreamFactory;

class CalendarController extends BaseController
{
    public function public(Request $request, Response $response): ResponseInterface
    {
        $uuid = $request->getAttribute('uuid');
        $settings = Setting::getWithKey('calendar.public');
        $baseUri = Config::getBaseUri();
        if (!$settings['enabled'] || !$uuid || $uuid !== $settings['uuid']) {
            throw new HttpNotFoundException($request);
        }

        $calendarEvents = [];
        $calendarBoundaries = ['start' => null, 'end' => null];

        //
        // - Événements.
        //

        $events = Event::orderBy('start_date', 'asc')
            ->where('end_date', '>=', new Carbon('3 months ago 00:00:00'))
            ->where('is_archived', false)
            ->get();

        foreach ($events as $event) {
            $eventStart = $event->getStartDate();
            $eventEnd = $event->getEndDate();

            if (!$calendarBoundaries['start'] || $eventStart < $calendarBoundaries['start']) {
                $calendarBoundaries['start'] = $eventStart;
            }
            if (!$calendarBoundaries['end'] || $eventEnd > $calendarBoundaries['end']) {
                $calendarBoundaries['end'] = $eventEnd;
            }

            $calendarEventId = new CalendarValue\UniqueIdentifier(
                md5((string) $baseUri->withPath(sprintf('/event/%d', $event->id)))
            );
            $calendarEvent = (new CalendarEvent($calendarEventId))
                ->setSummary($event->title)
                ->setOccurrence(new CalendarValue\TimeSpan(
                    new CalendarValue\DateTime($eventStart, false),
                    new CalendarValue\DateTime($eventEnd, false),
                ));

            if (!empty($event->description)) {
                $calendarEvent->setDescription($event->description);
            }

            if (!empty($event->location)) {
                $calendarEvent->setLocation(new CalendarValue\Location($event->location));
            }

            if (!empty($event->updated_at) || !empty($event->created_at)) {
                $eventLastTouch = !empty($event->updated_at)
                    ? $event->updated_at
                    : $event->created_at;
                $calendarEvent->touch(new CalendarValue\Timestamp($eventLastTouch));
            }

            $calendarEvents[] = $calendarEvent;
        }

        //
        // - Rendu.
        //

        $timeZone = CalendarTimeZone::createFromPhpDateTimeZone(
            new \DateTimeZone(@date_default_timezone_get()),
            $calendarBoundaries['start'] ?? new Carbon('today 00:00:00'),
            $calendarBoundaries['end'] ?? new Carbon('today 23:59:59'),
        );

        $calendar = (new Calendar($calendarEvents))
            ->addTimeZone($timeZone);

        // - Specifies a suggested iCalendar file download frequency for clients with sync capabilities.
        // @see https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxcical/1fc7b244-ecd1-4d28-ac0c-2bb4df855a1f
        $calendar->setPublishedTTL(new \DateInterval('PT5M'));

        return $response
            ->withStatus(StatusCode::STATUS_OK)
            ->withFile(
                (new StreamFactory())->createStream(
                    (string) (new CalendarFactory())->createCalendar($calendar)
                ),
                'text/calendar',
            );
    }
}
