<?php
declare(strict_types=1);

namespace Loxya\Tests;

use Loxya\Support\BaseUri;

final class BaseUriTest extends TestCase
{
    public function testWithPath(): void
    {
        //
        // - Uri simple.
        //

        $result = (string) (new BaseUri('http://loxya-app.com'))->withPath('/');
        $this->assertSame($result, 'http://loxya-app.com/');

        $result = (string) (new BaseUri('http://loxya-app.com'))->withPath('/sub/dir');
        $this->assertSame($result, 'http://loxya-app.com/sub/dir');

        //
        // - Uri de base avec dossier.
        //

        $result = (string) (new BaseUri('http://loxya-app.com/loxya'))->withPath('/');
        $this->assertSame($result, 'http://loxya-app.com/loxya/');

        $result = (string) (new BaseUri('http://loxya-app.com/sub/loxya/'))->withPath('/dir/file.js');
        $this->assertSame($result, 'http://loxya-app.com/sub/loxya/dir/file.js');

        //
        // - Chemin uniquement.
        //

        $result = (string) (new BaseUri('/'))->withPath('/');
        $this->assertSame($result, '/');

        $result = (string) (new BaseUri('/'))->withPath('/sub/dir');
        $this->assertSame($result, '/sub/dir');

        //
        // - Chemin de base avec dossier.
        //

        $result = (string) (new BaseUri('/loxya'))->withPath('/');
        $this->assertSame($result, '/loxya/');

        $result = (string) (new BaseUri('/sub/loxya/'))->withPath('/dir/file.js');
        $this->assertSame($result, '/sub/loxya/dir/file.js');
    }
}
