<?php
	$inData = getRequestInfo();

	$name = $inData["name"];
	$phone = $inData["phone"];
    $email = $inData["email"]; 
    $userID = $inData["userID"]; 

    $doesIdExist = 0; 

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{

        $stmt = $conn->prepare("SELECT COUNT(*) FROM Users WHERE ID = ?"); 
        $stmt->bind_param("s", $userID); 
        $stmt->execute(); 
        $result = $stmt->get_result(); 

        $result = $result->fetch_array();
        $doesIdExist = intval($result[0]);

        if($doesIdExist != 0){

            $stmt = $conn->prepare("INSERT into Contacts (Name, Phone, Email, UserID) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $name, $phone, $email, $userID);
            $stmt->execute();
            $stmt->close();
            $conn->close();
            returnWithError("");

        }else{
            returnWithError("User with this ID does not exist"); 
        }
        
            
		
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
