<?php

date_default_timezone_set('UTC');

$mysqli = new mysqli("localhost", "root", "r**t", "calendario");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}
else{
	if (isset($_POST['type'])) {

		$type = $_POST['type'];

		if($type == 'new')
		{			
			$title = $_POST['title'];
			$startdate = $_POST['startdate'];
			$enddate = $_POST['enddate'];
			$startTime = $_POST['startTime']; 
			$endTime = $_POST['endTime'];
			$query = "INSERT INTO eventos(titulo, start_day, end_day, start_time, end_time, type_publicacion) VALUES('$title', '$startdate', '$enddate', '$startTime', '$endTime', 'deporte')";
			if ($mysqli->query($query)) {
				$lastid = $mysqli->insert_id;
				echo json_encode(array('status'=>'success','eventid'=>$lastid));
			}
			else
				echo json_encode(array('status'=>'failed'));
			
		}

		if($type == 'changetitle')
		{
			$eventid = $_POST['eventid'];
			$title = $_POST['title'];
			$update = $mysqli->query("UPDATE eventos SET titulo='$title' where publicacion_Id='$eventid'");
			if($update)
				echo json_encode(array('status'=>'success'));
			else
				echo json_encode(array('status'=>'failed'));
		}

		if($type == 'resetdate')
		{
			$title = $_POST['title'];
			$startdate = $_POST['startdate'];
			$enddate = $_POST['enddate'];
			$startTime = $_POST['startTime']; 
			$endTime = $_POST['endTime'];
			$eventid = $_POST['eventid'];
			$update = $mysqli->query("UPDATE eventos SET titulo='$title', start_day = '$startdate', end_day = '$enddate', start_time = '$startTime', end_time = '$endTime' where publicacion_Id='$eventid'");
			if($update)
				echo json_encode(array('status'=>'success'));
			else
				echo json_encode(array('status'=>'failed'));
		}

		if($type == 'remove')
		{
			$eventid = $_POST['eventid'];
			$delete = $mysqli->query("DELETE FROM eventos where publicacion_Id='$eventid'");
			if($delete)
				echo json_encode(array('status'=>'success'));
			else
				echo json_encode(array('status'=>'failed'));
		}

		if($type == 'fetch')
		{

			$rs = $mysqli->query("SELECT end_day, end_time, start_day, start_time, titulo, publicacion_Id FROM eventos");

			$output_arrays = array();

			while ($row = $rs->fetch_array() ){
				$fetchedPub=array(
					'id' => $row[5],
					'start' => $row[2]. 'T' .$row[3],
					'end' => $row[0].'T'.$row[1],
			        'title' =>$row[4]);
				array_push($output_arrays, $fetchedPub);
			}

			echo json_encode($output_arrays);
		}

	}

	else
		echo "No esta llegando la variable";

}