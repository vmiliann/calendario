<?php

date_default_timezone_set('UTC');


$mysqli = new mysqli("localhost", "root", "r**t", "calendario");
if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}
else{
	$rs = $mysqli->query("SELECT end_day, end_time, start_day, start_time, titulo FROM eventos");

	$output_arrays = array();

	while ($row = $rs->fetch_array() ){
		//echo 'dia_inicio=' . $row[2] . ', dia_fin=' . $row[0] . ', hora_inicio='. $row[3]. ', hora_fin=' . $row[1] . ', titulo=' . $row[4] . "<br />";
		$fetchedPub=array(
			'start' => $row[2]. 'T' .$row[3],
			'end' => $row[0].'T'.$row[1],
			//'startTime'=>$row[3],
			//'startDate'=>$row[2],
	        //'endTime'=>$row[1],
	        //'endDate'=>$row[0],
	        'title' =>$row[4]);
		array_push($output_arrays, $fetchedPub);
	}

	echo json_encode($output_arrays);
}