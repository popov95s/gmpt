<?php
// Routes
include 'project.php';
include 'meetings.php';
include 'user.php';
include 'chat.php';

//test
$app->get('/projects',
	function($request,$response,$args) {
		$db=$this->GMPT;
		$UserID = (int)$request->getAttribute('UserID');
		
		$query = $db->prepare("CALL GetProjects(?)");
		$query->bindParam(1,$UserID, PDO::PARAM_INT);
		$result=$query->execute();
		$response=getProjects($query);
		unset($query);	
		return $response;
	}
)->add($validateSession);


//test
$app->post('/projects',
	function($request,$response,$args) {
		$db=$this->GMPT;

		$GroupName = $_POST['GroupName'];
		$Description = $_POST['Description'];

		echo $GroupName;
		echo $Description;
		$query = $db->prepare("CALL CreateProject(?,?)");
		$query->bindParam(1,$GroupName, PDO::PARAM_STR);
		$query->bindParam(2,$Description, PDO::PARAM_STR);
		$ProjID = (int)$query->execute();
		echo json_encode($query);
		unset($query);
		//$query=$db->query("INSERT INTO Project (GroupName,Description) VALUES('$GroupName', '$Description');");
		
		//get user id by email
		$users = $_POST['users'];
		$userIDs = [];
		$userRoles = [];
		foreach ($users as $user) {
			$email = $user['email'];
			$role = $user['roleName'];
			$query2 = $db->prepare("CALL GetUserIDByEmail(?)");
			$query2->bindParam(1,$email,PDO::PARAM_STR);
			$userID = (int)$query2->execute();
			unset($query2);
			array_push($userIDs,$userID);
			array_push($userRoles,$role);
		}
		//add user to project
		$counter = 0;
		foreach($userIDs as $uID) {
			$query3 = $db->prepare("CALL AddUserToProject(?,?,?)");
			$query3->bindParam(1,$ProjID, PDO::PARAM_INT);
			$query3->bindParam(1,$uID, PDO::PARAM_INT);
			$query3->bindParam(1,$userRoles[$counter], PDO::PARAM_STR);
			unset($query3);
			$counter = $counter + 1;
		}

		$response = array("worked"=>true);
		return json_encode($response);

	}
)->add($validateSession);

//test
$app->get('/project/{ProjectID}',
	function($request,$response,$args) {
		$db = $this->GMPT;
		$ProjectID = $request->getAttribute('ProjectID');
		$query=$db->query("SELECT * FROM Project WHERE ProjectID = '$ProjectID';");
		$response = getProjectByID($query);
		echo json_encode($response);
	}		
);
/*
$app->group('/project/{id}', function() {
	$this->map(['GET','DELETE','PATCH','PUT'], '', function ($request,$response,$args) {

	})->setName('project');
	$this->get('/getByUserID', function($request,$response,$args) {
		

	})->setName('getProjectByUserID');
});
*/
//test stuff
$app->get('/goodbye', 
	function($request,$response,$args) {
	    $response->getBody()->write("Time to go. Goodbye!");
		$userID = $request->getAttribute('UserID');
			
	    $response->getBody()->write($userID);	
		
		return $response;
	}
	
	
)->add($validateSession);


//validate if user is correct
$app->post('/login', function ($request, $response, $args) {
    
	$form_data = $request->getParsedBody();
	$username = $form_data['username'];
	$password = $form_data['password'];
	//set token
	$db=$this->GMPT;
		
	//get salt
	$getSaltQuery = $db->prepare("CALL GetSalt(?)");
	$getSaltQuery->execute(array($username));
	$rArray=array();
	foreach($getSaltQuery as $row){
		$rArray[$username]=$row['Salt'];
	}
	//hash pass with salt
	$hashedPass= hash('sha256',$password.($rArray[$username]));
	$getSaltQuery->closeCursor();
	//validate user
	$validateUserQuery= $db->prepare("CALL ValidateUser(?,?)");
	
	$validateUserQuery->bindValue(1, $username, PDO::PARAM_STR);
	$validateUserQuery->bindValue(2, $hashedPass, PDO::PARAM_STR);
	$validateUserQuery->execute();
	$tokenArray=array();
	foreach($validateUserQuery as $row){
		$tokenArray[$username]=$row['ReturnToken'];
	}
	
	//get token 
	
	
	
	//set Authorization header to token
	$returnArray1=array();
	$returnArray1['Authorization']=$tokenArray[$username];
	
	$response= $response->getBody()->write(json_encode($returnArray1));

	//return the response
	return $response;
	
});

//test
//Register:  POST @ /user endpoint
$app->post('/user', 
	function($request, $response,$args){
		$form_data = $request->getParsedBody();
		$username = $form_data['username'];
		$password = $form_data['password'];
		$fName  = $form_data['firstName'];
		$lName = $form_data['lastName'];
		$email = $form_data['email'];
		$db = $this->GMPT;		
		$salt = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);
		$passwordHash = hash('sha256',$password.$salt);
		
		//$returnArray = array("Volvo", "BMW", "Toyota");
		//prepare query
		$registerQuery=$db->prepare("CALL CreateUser (?,?,?,?,?,?)");
		$registerQuery->bindValue(1, $username, PDO::PARAM_STR);
		$registerQuery->bindValue(2, $passwordHash, PDO::PARAM_STR);
		$registerQuery->bindValue(3, $fName, PDO::PARAM_STR);
		$registerQuery->bindValue(4, $lName, PDO::PARAM_STR);
		$registerQuery->bindValue(5, $salt, PDO::PARAM_STR);
		$registerQuery->bindValue(6, $email, PDO::PARAM_STR);
		
		$registerQuery->execute();

		
		$returnArray = array($username, $passwordHash, $fName, $lName, $email);
		$response->getBody()->write(json_encode($returnArray));
		return $response;
		
	}
);	

//close session
$app->get('/logout', function ($request, $response, $args) {

	$token = $request->getAttribute('Token');
	$db=$this->GMPT;
	echo "We passed the middleware authentication";
	
	//$closeSessionQuery= $db->prepare('UPDATE Session SET LogoutTimestamp=NOW() WHERE SessionID = ?');
	$closeSessionQuery= $db->prepare('CALL CloseSession(?)');
	//$closeSessionQuery->bindParam(1, $token, PDO::PARAM_STR);
	$closeSessionQuery->execute(array($token));
	return $response;
})->add($validateSession);

//Edit a user: PUT @ /user endpoint
$app->put('/user', 
	function($request, $response,$args){
		$form_data = $request->getParsedBody();
		$username = $form_data['username'];
		$password = $form_data['password'];
		$fName  = $form_data['firstName'];
		$lName = $form_data['lastName'];
		$email = $form_data['email'];
		$db = $this->GMPT;		
		$salt = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 10);
		$passwordHash = hash('sha256',$password.$salt);
		
		//$returnArray = array("Volvo", "BMW", "Toyota");
		//prepare query
		$registerQuery=$db->prepare("CALL UpdateUser (?,?,?,?,?,?)");
		$registerQuery->bindValue(1, $username, PDO::PARAM_STR);
		$registerQuery->bindValue(2, $passwordHash, PDO::PARAM_STR);
		$registerQuery->bindValue(3, $fName, PDO::PARAM_STR);
		$registerQuery->bindValue(4, $lName, PDO::PARAM_STR);
		$registerQuery->bindValue(5, $salt, PDO::PARAM_STR);
		$registerQuery->bindValue(6, $email, PDO::PARAM_STR);
		
		$registerQuery->execute();

		
		$returnArray = array($username, $passwordHash, $fName, $lName, $email);
		$response->getBody()->write(json_encode($returnArray));
		return $response;
		
	}
)->add($validateSession);
/*
//test json_encode
//Returns all groups for the currently authenticated user
$app->get('/groups',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		return $response->getBody()->write(json_encode(getGroups($userID)));
	}

)->add($validateSession);
//test
//Creates a new group
$app->post('/groups',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$groupName = $request->getAttribute('groupName');
		$description = $request->getAttribute('description');
		$users= $request->getAttribute('users');
		postGroups($userID,$groupID,$groupName,$users);
	}
)->add($validateSession);

//test
//Gets all information about a group by groupID
$app->get('/groups/{groupID}',
	function($request,$response,$args) {
		//
	}		
)->add($validateSession);

//test
//Gets all meetings for currently authenticated user
$app->get('/meetings/',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		return $response->body(json_encode(getMeetings($userID)));

	}	
)->add($validateSession);

//test
//Gets all meetings by GroupID
$app->get('/meetings/{groupID}',
	function($request,$response,$args) {
		
		$userID = $request->getAttribute('UserID');
		$groupID=$request->getAttribute('groupID');
		return $response->body(json_encode(getMeetingsByGroup($userID,$groupID)));

	}		
)->add($validateSession);

//test
//Gets meeting by meetingID
$app->get('/meetings/{meetingID}',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$meetingID=$request->getAttribute('meetingID');
		return $response->body(json_encode(getMeetingByMeetingID($userID,$meetingID)));

	}		
)->add($validateSession);

//test
//Edit meeting by meeting ID : PUT @ /meetings/{meetingID}
$app->put('/meetings/{meetingID}',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$topic = $request->getAttribute('topic');
		$groupName = $request->getAttribute('groupName');
		$date = $request->getAttribute('date');
		$description = $request->getAttribute('description');
		$location = $request->getAttribute('location');
		$startTime = $request->getAttribute('startTime');
		$endTime = $request->getAttribute('endTime');
		$meetingID=$request->getAttribute('meetingID');
		
		return $response->body(json_encode(editMeetingByMeetingID($userID,$topic,$groupName,$date,$description,$location,$startTime,$endTime,$meetingID)));
		
	}		
)->add($validateSession);


//test
//Creates a meeting
$app->post('/meetings/',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$topic = $request->getAttribute('topic');
		$groupName = $request->getAttribute('groupName');
		$date = $request->getAttribute('date');
		$description = $request->getAttribute('description');
		$location = $request->getAttribute('location');
		$startTime = $request->getAttribute('startTime');
		$endTime = $request->getAttribute('endTime');


		createMeeting($userID,$topic,$groupName,$date,$description,$location,$startTime,$endTime);		

	}	
)->add($validateSession);


//test 


//test
//Edit group by GroupID : PUT @  /groups/{groupID} endpoint 
$app->put('/groups/{groupID}',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$groupID = $request->getAttribute('groupID');
		$groupName = $request->getAttribute('groupName');
		$description = $request->getAttribute('description');
		$users= $request->getAttribute('users');
		
		editGroupByGroupID($userID,$groupID, $groupName, $description, $users);
		
	}
)->add($validateSession);

//test
//Get chat by GroupID : GET @ /chat/{groupID} endpoint
$app->get('/chat/{groupID}',
	function($request,$response,$args) {
		$userID = $request->getAttribute('UserID');
		$groupID = $request->getAttribute('groupID');
		return $request->body(json_encode($getChatByGroupID($userID,$groupID)));
	}
)->add($validateSession);

*/
 
/*
$app->put('/groups/{groupID}',
	function($request,$response,$args) {
		$db=$this->GMPT;
		$groupID = $request->getAttribute('groupID');
		$groupName = $request->getAttribute('groupName');
		$description = $request->getAttribute('description');
		$meetingID = $request->getAttribute('meetingID');
		$query=$db->query('INSERT INTO Groups (groupName,description, meetingID) VALUES($groupName, $description, $meetingID);');
		
	}
);*/

