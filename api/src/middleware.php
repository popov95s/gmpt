<?php
// Application middleware

// e.g: $app->add(new \Slim\Csrf\Guard);
<<<<<<< HEAD
$mw = (function ($request, $response, $next) {
	

	$token = $request->getHeader("Authorization")[0];
	echo $token;
	
	$request= $request->withAttribute('test','TESTER');
	$response = $next($request, $response);
	$response= $response->withHeader('Access-Control-Allow-Origin','*');
	$response= $response->withHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
	$response= $response->withHeader('Access-Control-Allow-Headers','*');
      
	
	return $response;
});

$validateSession= (function ($request,$response,$next) {
	//get authorization header
	$token = $request->getHeader("Authorization")[0];
	
	$db=$this->GMPT;
	//see if token exists 
	$validateSessionQuery=$db->prepare("CALL ValidateSession(?)");
	$validateSessionQuery->execute(array($token));
	
	//if we found the token
	if($validateSessionQuery->rowCount()==1){
		foreach($validateSessionQuery as $row){
			$returnArray[0]=$row['userID'];
		}
		unset($validateSessionQuery);
		$request=$request->withAttribute('UserID',$returnArray[0]);
		$request=$request->withAttribute('Token',$token);
		//do everything else in routes and return response 
		$response=$next($request,$response);
		return $response;
	}
	//if no such token, return nothing in response 
	else{
		return $response->withStatus(404);
	}
		
	
	
});
?>
=======
>>>>>>> 49418717eeb0872c668b38bc9db82a491ecc75a8
