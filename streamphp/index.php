<?php

require __DIR__.'/vendor/autoload.php';

use Ratchet\Client\WebSocket;
use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

// Define the username and password
$username = 'testuser';
$password = 'pass@123';

// Make a POST request to the login endpoint to get the access token
$ch = curl_init('http://localhost:8080/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['username' => $username, 'password' => $password]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$token = json_decode($response);
echo $token;
// Connect to the WebSocket server with the access token
$ws = new WebSocket('ws://localhost:8081?token='.$token);

// Send the access token in the first message to the server
$ws->on('open', function (WebSocket $conn) use ($token) {
    $msg = new Message(json_encode(['token' => $token]));
    $conn->sendFrame($msg);
});

// Handle incoming messages from the server
$ws->on('message', function (WebSocket $conn, Message $msg) {
    // Parse the message JSON data
    $data = json_decode($msg->getPayload(), true);

    // Display the message content
    echo "Here the random generated number for a second is ".$data."\n";
});

// Handle connection errors
$ws->on('error', function (WebSocket $conn, \Exception $e) {
    echo "Error: ".$e->getMessage()."\n";
});

// Handle connection close
$ws->on('close', function ($code = null, $reason = null) {
    echo "Connection closed (code=$code, reason=$reason)\n";
});

// Run the WebSocket client loop
\Ratchet\Client\connect('ws://localhost:8081?token='.$token, [], [], new \React\EventLoop\StreamSelectLoop())->then(function(WebSocket $conn) {
    $conn->send('Hello WebSocket server!');
}, function(\Exception $e) {
    echo "Could not connect: ".$e->getMessage()."\n";
});

