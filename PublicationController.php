<?php

namespace Primicia\PublicationBundle\Controller;

use Primicia\PublicationBundle\Entity\Publication;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use DateInterval;


class PublicationController extends Controller
{
    public function indexAction()
    {
        $html = $this->render('PublicationBundle:Default:index.html.twig');
        return $html;
    }

    public function editAction(){
        $html = $this->renderView('PublicationBundle:Default:edit.html.twig');

        return new JsonResponse(
            array('html'=>$html)
        );
    }

    public function createPublicationAction(Request $request){
        $ras = $request->getContent();
        $params = json_decode($ras, true);
        $em = $this->getDoctrine()->getManager();

        $publication = new Publication();

        $startTime = date_create_from_format('Y-m-d g:i:s a', $params['startTime']);
        $publication->setStartTime($startTime);
        $endTime;
        
        $startDate = date_create_from_format('Y-m-d g:i:s a', $params['startDate']);
        $endDate = date_create_from_format('Y-m-d g:i:s a', $params['endDate']);
        $type = $params['type_publication'];
        $duration;
        if($type == 'noticia'){
            $endTime = date_create_from_format('Y-m-d g:i:s a', $params['startTime']);
            $duration = $em->getRepository('NoticiasBundle:News')->findBy(array('newsId'=>$params['type_id']))[0]->toArray()[6];
            $endTime = $endTime->add(new DateInterval('PT'.$duration.'S'));
        }
        else if ($type == 'cartelera' || $type == 'cartelera corta'){
            $endTime = date_create_from_format('Y-m-d g:i:s a', $params['startTime']);
            $duration = $em->getRepository('PublicationBundle:Publication')->findCarteleraDuracion($type, $startTime);
            $endTime = $endTime->add(new DateInterval('PT'.$duration.'S'));
        }
        else{
            $endTime = date_create_from_format('Y-m-d g:i:s a', $params['endTime']);
            if ($endTime == false)
                $endTime = date_create_from_format('Y-m-d g:i:s A', $params['endTime']);
        }

        $publication->setEndTime($endTime);
        $publication->setStartDate($startDate);
        $publication->setEndDate($endDate);
        $publication->setTypePublication($type);
        $publication->setIdType($params['type_id']);
        $publication->setBlockId($params['idBlock']);
        $publication->setInTransmission($params['inTransmission']);
        $publication->setIdType($params['type_id']);

        $em->persist($publication);
        $em->flush();
        $publicationId = $em->getRepository('PublicationBundle:Publication')->findBy(array('startTime'=>$publication->getStartTime(), 'startDate'=>$publication->getStartDate()))[0]->getPublicationId();

        return new Response(
            json_encode(
                $publicationId
                 
            ), 200
        );

    }

    /**
     * @param Request $request
     * @param $id
     * @return Response
     */
    public function updatePublicationAction(Request $request, $id){
        $em = $this->getDoctrine()->getManager();
        $ras = $request->getContent();
        $params = json_decode($ras, true);
        $publications = $em->getRepository('PublicationBundle:Publication')->findAll();
        $publication = $em->getRepository('PublicationBundle:Publication')->findOneBy(array('publicationId' => $id));

        $startTime = date_create_from_format('Y-m-d g:i:s a', $params['startTime']);
        $endTime = date_create_from_format('Y-m-d g:i:s a', $params['endTime']);
        $startDate = date_create_from_format('Y-m-d g:i:s a', $params['startDate']);
        $endDate = date_create_from_format('Y-m-d g:i:s a', $params['endDate']);

        if ($endTime == false)
            $endTime = date_create_from_format('Y-m-d g:i:s A', $params['endTime']);

        $publication->setStartTime($startTime);
        $publication->setEndTime($endTime);
        $publication->setStartDate($startDate);
        $publication->setEndDate($endDate);
        $publication->setBlockId($params['parent']);

        foreach ($publications as $pub){
            /*Pendiente a preguntar el comportamiento*/
        }

        $em->persist($publication);
        $em->flush();
        return new Response(
            json_encode(
                'updated'
            ), 200
        );
    }

    public function deletePublicationAction($id){
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('PublicationBundle:Publication')->findOneBy(array('publicationId' => $id));
        $em->remove($entity);
        $em->flush();
        return new Response(
            json_encode(
                'deleted'
            ), 200
        );
    }

    public function listPublicationAction(Request $request){
        $em = $this->getDoctrine()->getManager();
        $publications = $em->getRepository('PublicationBundle:Publication')->findAll();
        $name = null;
        $result=array();
        $ras = $request->getContent();
        $params = json_decode($ras, true);
        $calendarStart = $params['start'];
        $calendarStart = date_create_from_format('Y-m-d', $calendarStart);
        $calendarEnd = $params['end'];
        $calendarEnd = date_create_from_format('Y-m-d', $calendarEnd);
        foreach ($publications as $publication) {
            if(!($publication->getStartDate()>=$calendarStart&&$publication->getEndDate()<=$calendarEnd))
                continue;
            if($publication->getTypePublication() == 'sennal'){
                $name = $em->getRepository('EditorialBundle:Signal')->findBy(array('id'=>$publication->getIdType()))[0]->toArray()[1];
            } else if ($publication->getTypePublication() == 'noticia'){
                $name = $em->getRepository('NoticiasBundle:News')->findBy(array('newsId'=>$publication->getIdType()))[0]->toArray()[1];
            } else if ($publication->getTypePublication() == 'bloque'){
                $name = $em->getRepository('EditorialBundle:NewsBlock')->findBy(array('id'=>$publication->getIdType()))[0]->toArray()[1];
            } else if ($publication->getTypePublication() == 'cartelera'){
                $name = 'Cartelera';
            } else if ($publication->getTypePublication() == 'cartelera corta'){
                $name = 'Cartelera Corta';
            } else if ($publication->getTypePublication() == 'patron'){
                $name = 'Patrón';
            } else if ($publication->getTypePublication() == 'creditos'){
                $name = 'Créditos';
            } else if ($publication->getTypePublication() == 'presentacion'){
                $name = 'Video de Presentación';
            }

            $fetchedPub=array('startTime'=>$publication->getStartTime(),
                'startDate'=>$publication->getStartDate(),
                'endTime'=>$publication->getEndTime(),
                'endDate'=>$publication->getEndDate(),
                'idPub'=>$publication->getPublicationId(),
                'type'=>$publication->getTypePublication(),
                'parent'=>$publication->getBlockId(),
                'ref'=>$publication->getIdType(),
                'title' =>$name,
            );
            array_push($result, $fetchedPub);
        }
        return new Response(
            json_encode(
                $result
            ), 200
        );
    }

    public function listResourcesAction(Request $request, $type)
    {
        $iDisplayStart = $request->query->get('iDisplayStart');
        $iDisplayLength = $request->query->get('iDisplayLength');
        $sEcho = $request->query->get('sEcho');
        $sSearch = $request->query->get('sSearch');
        $iLimit = 10;
        $em = $this->getDoctrine()->getManager();
        $result = array();

        if (isset($iDisplayStart) && $iDisplayLength != '-1') {
            $iLimit = abs($iDisplayLength - $iDisplayStart);
        }

        if ($sSearch != "") {
            if ($sSearch == 'bloque_Block' || $sSearch == 'noticia_News' || $sSearch == 'señal_Signal'){
                if ($sSearch == 'bloque_Block'){
                    $newsBlock = $em->getRepository('EditorialBundle:NewsBlock')->typeFilterPublication('bloque');
                    foreach ($newsBlock as $nb)
                        $result[] = $nb;
                } else if ($sSearch == 'noticia_News'){
                    $news = $em->getRepository('NoticiasBundle:News')->typeFilterPublication('noticia_News');
                    foreach ($news as $n)
                        $result[] = $n;
                } else {
                    $signal = $em->getRepository('EditorialBundle:Signal')->typeFilterPublication('sennal');
                    foreach ($signal as $s)
                        $result[] = $s;
                }
            } else {
                $newsBlock = $em->getRepository('EditorialBundle:NewsBlock')->weakFilterPublication($sSearch);
                $news = $em->getRepository('NoticiasBundle:News')->weakFilterPublication($sSearch);
                $signal = $em->getRepository('EditorialBundle:Signal')->weakFilterPublication($sSearch);
                foreach ($newsBlock as $nb)
                    $result[] = $nb;
                foreach ($news as $n)
                    $result[] = $n;
                foreach ($signal as $s)
                    $result[] = $s;
            }
        } else {
            if ($type == 'bloque'){
                $newsBlock = $em->getRepository('EditorialBundle:NewsBlock')->filterPublication();
                foreach ($newsBlock as $nb)
                    $result[] = $nb;
            }
        }

        $aaData = array_slice($result, $iDisplayStart, $iDisplayLength);

        return new Response(
            json_encode(
                array(
                    "sEcho" => intval($sEcho),
                    'iTotalRecords' => $iLimit,
                    'iTotalDisplayRecords' => sizeof($result),
                    'aaData' => $aaData
                )
            ), 200
        );
    }
}
