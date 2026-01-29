<?php

return [

    'pdf' => [
        'enabled' => true,
        'binary' => 'C:/PROGRA~1/wkhtmltopdf/bin/wkhtmltopdf.exe',
        'timeout' => false,
        'options' => [],
        'env' => [],
    ],

    'image' => [
        'enabled' => true,
        'binary' => env('WKHTML_IMG_BINARY', 'wkhtmltoimage'),
        'timeout' => false,
        'options' => [],
    ],

];
