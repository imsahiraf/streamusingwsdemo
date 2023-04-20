<?php

require __DIR__ . '/vendor/autoload.php';
use Ratchet\Client\WebSocket;

$username = 'testuser';
$password = 'pass@123';

// Set up cURL to make the login request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['username' => $username, 'password' => $password]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute the login request and handle any errors
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($http_code == 200) {
    // If the login was successful, get the token from the response
    $token = $response;
    // echo $token;
    // Set up the WebSocket connection with the token as a query parameter
    $ws = new \React\Socket\ConnectionInterface('ws://localhost:8081?token=' . $token, [], ['Authorization' => 'Bearer ' . $token]);

    // Define the behavior of the WebSocket connection
    $ws->on('message', function ($data) {
        // Handle the received data
        echo 'Here the random generated number for a second is ' . $data . PHP_EOL;
    });

    $ws->on('close', function ($code = null, $reason = null) {
        // Handle the WebSocket connection closing
        echo 'Disconnected from server' . PHP_EOL;
    });

    // Open the WebSocket connection
    $ws->connect();
} elseif ($http_code == 401) {
    // Handle login failure due to invalid credentials
    echo 'You are trying to login with wrong credentials.' . PHP_EOL;
} elseif ($http_code == 402) {
    // Handle login failure due to already being logged in with these credentials
    echo 'You are already logged in with these credentials.' . PHP_EOL;
} else {
    // Handle other login failures
    echo 'An error occurred during login.' . PHP_EOL;
}

// Close the cURL request
curl_close($ch);

?>
