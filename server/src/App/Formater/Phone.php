<?php

namespace Robert2\API\Formater;

trait Phone
{
    public function normalizePhone(string $phone): string
    {
        return preg_replace('/ /', '', $phone);
    }
}
