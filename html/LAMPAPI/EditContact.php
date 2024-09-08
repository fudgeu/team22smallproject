<?php
    $inData = getRequestInfo();

    $newname = $inData["newname"];
    $newphone = $inData["newphone"];
    $newemail = $inData["newemail"]; 
    $name = $inData["name"];
    $phone = $inData["phone"];
    $email = $inData["email"]; 
    $userID = $inData["userID"]; 

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
                $stmt = $conn->prepare("UPDATE Contacts SET Name = ?, Phone = ?, Email = ? WHERE Name=? and Phone=? and Email=? and UserID=?");
                $stmt->bind_param("sssssss", $newname, $newphone, $newemail, $name, $phone, $email, $userID);
                $stmt->execute();
                $result = $stmt->get_result();
                $stmt->close();
                $conn->close();
                returnWithError("");
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