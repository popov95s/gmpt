<?php 
$app->get('/chat/{project_id}', function($request,$response,$args) {
		$userID = (int)$request->getAttribute('UserID');
		$projectID = $request->getAttribute('project_id');
		$db=$this->GMPT;
		
		$stmt = $db->prepare("CALL GetMessageRoomID(?)");
        $stmt->bindParam(1, $projectID, PDO::PARAM_INT);
		$result = $stmt->execute();
		if ($result) {
			$messageRoomID = (int)$stmt->fetchAll()[0]["MessageRoomID"];
			unset($stmt);
			
			$returnArray = array();
			
			//read receipt functionality 
			$setChatLastRead = $db->prepare("CALL SetChatLastRead(?,?)");
			$setChatLastRead->execute(array($userID,$messageRoomID));
			unset($setChatLastRead);
			
			
			$stmt1 = $db->prepare("CALL GetMessages(?,?,?)");
			$stmt1->bindParam(1, $messageRoomID, PDO::PARAM_INT);
			$stmt1->bindParam(2, $userID, PDO::PARAM_INT);
			$stmt1->bindParam(3, $projectID, PDO::PARAM_INT);
			$resultOne = $stmt1->execute();
			if ($resultOne) {
				$messages = $stmt1->fetchAll();
				$returnArray["messages"] = $messages;
				unset($stmt1);
			}
			else {
				$response = $response->withStatus(400);
			}
			
			$readArray=array();
			
			$getUserIDsByProjectID= $db->prepare("CALL GetUserIDsByProjectID(?)");
			$getUserIDsByProjectID->execute(array($projectID));
			$row= $getUserIDsByProjectID->fetchAll();
			unset($getUserIDsByProjectID);
			foreach($row as $data){
				$readArray1=array();
				$readerName=$data['FirstName'];
				$readerID= $data['UserID'];
				$numberOfUnread= $db->prepare("CALL GetUnreadMessages(?,?)");
				$numberOfUnread->execute(array($readerID,$messageRoomID));
				$unreadResult=$numberOfUnread->fetchAll();
				$numberOfUnreadMessages=(int)$unreadResult[0]['count(*)'];
				
				$readArray1['firstName']=$readerName;
				$readArray1['unreadMessageCount']=$numberOfUnreadMessages;
				array_push($readArray,$readArray1);
				unset($numberOfUnread);
			}
			
			$returnArray['readReceipts']=$readArray;
			
			
			
			$response->getBody()->write(json_encode($returnArray));
		}
		else {
			$response = $response->withStatus(400);
		}
	}
)->add($validateSession);


//test
$app->post('/chat/{project_id}', function($request,$response,$args) {
		$userID = (int)$request->getAttribute('UserID');
		$projectID = $request->getAttribute('project_id');
		$message_data = $request->getParsedBody();
		$text = $message_data['text'];
		$anonymous = $message_data['anonymous'];
		$db=$this->GMPT;
		
		$stmt = $db->prepare("CALL GetMessageRoomID(?)");
        $stmt->bindParam(1, $projectID, PDO::PARAM_INT);
		$result = $stmt->execute();
		if ($result) {
			$messageRoomID = (int)$stmt->fetchAll()[0]["MessageRoomID"];
			unset($stmt);
			$stmt1 = $db->prepare("CALL CreateMessage(?,?,?,?)");
			$stmt1->bindParam(1, $userID, PDO::PARAM_INT);
			$stmt1->bindParam(2, $messageRoomID, PDO::PARAM_INT);
			$stmt1->bindParam(3, $text, PDO::PARAM_STR);
			$stmt1->bindParam(4, $anonymous, PDO::PARAM_BOOL);
			$resultOne = $stmt1->execute();
			if ($resultOne) {
				unset($stmt1);
			}
			else {
				$response = $response->withStatus(400);
			}
		}
		else {
			$response = $response->withStatus(400);
		}
	}
)->add($validateSession);
