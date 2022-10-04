<?php
declare(strict_types=1);

namespace Robert2\API\Controllers;

use Fig\Http\Message\StatusCodeInterface as StatusCode;
use Robert2\API\Config\Config;
use Robert2\API\Models\Event;
use Robert2\API\Models\Setting;
use Slim\Exception\HttpNotFoundException;
use Slim\Http\Response;
use Slim\Http\ServerRequest as Request;
use Eluceo\iCal\Domain\Entity\Calendar as Calendar;
use Eluceo\iCal\Domain\Entity\Event as CalendarEvent;
use Eluceo\iCal\Domain\Entity\TimeZone as CalendarTimeZone;
use Eluceo\iCal\Domain\ValueObject as CalendarValue;
use Eluceo\iCal\Presentation\Factory\CalendarFactory;
use Slim\Psr7\Factory\StreamFactory;

class CalendarController extends BaseController
{
    public function public(Request $request, Response $response): Response
    {
        $uuid = $request->getAttribute('uuid');
        $settings = Setting::getWithKey('calendar.public');
        if (!$settings['enabled'] || !$uuid || $uuid !== $settings['uuid']) {
            throw new HttpNotFoundException($request);
        }

        $events = Event::orderBy('start_date', 'asc')
            ->where('end_date', '>=', new \DateTime('3 months ago 00:00:00'))
            ->where('is_archived', false)
            ->get();

        $calendarEvents = [];
        $calendarBoundaries = ['start' => null, 'end' => null];
        foreach ($events as $event) {
            $eventStart = new \DateTimeImmutable($event->start_date);
            $eventEnd = new \DateTimeImmutable($event->end_date);

            if (!$calendarBoundaries['start'] || $eventStart < $calendarBoundaries['start']) {
                $calendarBoundaries['start'] = $eventStart;
            }
            if (!$calendarBoundaries['end'] || $eventEnd > $calendarBoundaries['end']) {
                $calendarBoundaries['end'] = $eventEnd;
            }

            $apiUrl = trim(Config::getSettings('apiUrl'), '/');

            $calendarEventId = new CalendarValue\UniqueIdentifier(
                md5(sprintf('%s/%d', $apiUrl, $event->id))
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
                $event->touch(new CalendarValue\Timestamp($eventLastTouch));
            }

            $calendarEvents[] = $calendarEvent;
        }

        $timeZone = CalendarTimeZone::createFromPhpDateTimeZone(
            new \DateTimeZone(@date_default_timezone_get()),
            $calendarBoundaries['start'] ?? new \DateTimeImmutable('today 00:00:00'),
            $calendarBoundaries['end'] ?? new \DateTimeImmutable('today 23:59:59'),
        );

        $calendar = (new Calendar($calendarEvents))
            ->addTimeZone($timeZone);

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
