<?php 
require __DIR__ . '/vendor/autoload.php';

use WebSocket\Client;

// Set the username and password
$username = 'anurag';
$password = 'pass@123';

// Create a JSON payload with the credentials
$data = json_encode(array('username' => $username, 'password' => $password));

// Set the headers for the HTTP POST request to the login endpoint
$headers = array(
  'Content-Type: application/json',
  'Content-Length: ' . strlen($data)
);

// Make the HTTP POST request to the login endpoint
$ch = curl_init('http://localhost:8080/login');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);

// Check the HTTP response code
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if($http_code != 200){
  if($http_code == 401){
    echo 'Error: Invalid login credentials'."\n";
  }
  if($http_code == 402){
    echo 'Error: You may have already logged in please disconnect there to connect here'."\n";
  }
  exit;
}

// Get the token from the response
$token = trim($response);

// Close the cURL session
curl_close($ch);

$ws = new Client("ws://localhost:8081", array(
  'headers' => array(
      'Sec-WebSocket-Protocol' => $token
  )
));

// Send the token in the first message to the server
$ws->send(json_encode(array('token' => $token)));

// Receive and handle incoming messages
while ($data = $ws->receive()) {
  $data = json_decode($data, true);
  echo "Here the random generated number for a second is " . $data . "\n";
}

// Close the WebSocket connection
$ws->close();

?>