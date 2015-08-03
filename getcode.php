<?php

$url = 'https://api.github.com/search/repositories?q=dabblet&callback=foo';
$ch = curl_init($url);

$t_vers = curl_version();
curl_setopt( $ch, CURLOPT_USERAGENT, 'curl/' . $t_vers['version'] );
curl_setopt($ch, CURLOPT_POST, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_VERBOSE, 1);
curl_setopt($ch, CURLOPT_NOBODY, 0);

$response = curl_exec($ch);
echo $response;
?>
