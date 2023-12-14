<?php
declare(strict_types=1);

namespace Loxya\Middlewares;

use Odan\Session\SessionManagerInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;

final class SessionStart implements MiddlewareInterface
{
    private SessionManagerInterface $session;

    public function __construct(SessionManagerInterface $session)
    {
        $this->session = $session;
    }

    public function process(ServerRequestInterface $request, RequestHandler $handler): ResponseInterface
    {
        if (!($request instanceof \Loxya\Http\Request)) {
            throw new \InvalidArgumentException('Not a Loxya request.');
        }

        // - Pas de session dans les contextes stateless d'API.
        if ($request->isApi()) {
            return $handler->handle($request);
        }

        if (!$this->session->isStarted()) {
            $this->session->start();
        }

        $response = $handler->handle($request);
        $this->session->save();

        return $response;
    }
}
