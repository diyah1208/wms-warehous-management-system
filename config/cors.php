<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://192.168.1.108:5173',
        'http://10.10.6.197:5173',
        'http://10.192.146.235:5173',
        'http://localhost:5173',
        'http://192.168.1.125:5173',
        'http://192.168.1.238:5173',
        'http://192.168.1.252:5173'
        // 'http://10.10.6.125:5173',
        //  'http://localhost:5173',
        // 'http://103.75.26.210:5173',
        // 'http://localhost:5173',
        // 'http://192.168.21.144:5173',
        // 'http://localhost:5173',
        // 'http://10.10.6.175:5173',
        // 'http://10.10.6.207:5173',
        // 'http://localhost:4173',
        // 'https://wms-warehouse-management-system.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];