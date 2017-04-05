<?php

namespace Primicia\PublicationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Publication
 *
 * @ORM\Table(name="publication")
 * @ORM\Entity(repositoryClass="Primicia\PublicationBundle\Repository\PublicationRepository")
 */
class Publication
{
    /**
     * @var int
     *
     * @ORM\Column(name="Publication_id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="SEQUENCE")
     * @ORM\SequenceGenerator(sequenceName="publication_publication_id_seq", allocationSize=1, initialValue=1)
     */
    private $publicationId;

    /**
     * @var string
     *
     * @ORM\Column(name="type_publication", type="text")
     */
    private $typePublication;

    /**
     * @var int
     *
     * @ORM\Column(name="id_type", type="integer", nullable=true)
     */
    private $idType;

    /**
     * @var int
     *
     * @ORM\Column(name="block_id", type="integer", nullable=true)
     */
    private $blockId;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="start_time", type="time", nullable=true)
     */
    private $startTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_time", type="time", nullable=true)
     */
    private $endTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="start_date", type="date", nullable=true)
     */
    private $startDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_date", type="date", nullable=true)
     */
    private $endDate;

    /**
     * @var bool
     *
     * @ORM\Column(name="in_transmission", type="boolean")
     */
    private $inTransmission;


    /**
     * Get publicationId
     *
     * @return integer 
     */
    public function getPublicationId()
    {
        return $this->publicationId;
    }

    /**
     * Set typePublication
     *
     * @param string $typePublication
     * @return Publication
     */
    public function setTypePublication($typePublication)
    {
        $this->typePublication = $typePublication;

        return $this;
    }

    /**
     * Get typePublication
     *
     * @return string 
     */
    public function getTypePublication()
    {
        return $this->typePublication;
    }

    /**
     * Set idType
     *
     * @param integer $idType
     * @return Publication
     */
    public function setIdType($idType)
    {
        $this->idType = $idType;

        return $this;
    }

    /**
     * Get idType
     *
     * @return integer 
     */
    public function getIdType()
    {
        return $this->idType;
    }

    /**
     * Set blockId
     *
     * @param integer $blockId
     * @return Publication
     */
    public function setBlockId($blockId)
    {
        $this->blockId = $blockId;

        return $this;
    }

    /**
     * Get blockId
     *
     * @return integer 
     */
    public function getBlockId()
    {
        return $this->blockId;
    }

    /**
     * Set startTime
     *
     * @param \DateTime $startTime
     * @return Publication
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * Get startTime
     *
     * @return \DateTime 
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * Set endTime
     *
     * @param \DateTime $endTime
     * @return Publication
     */
    public function setEndTime($endTime)
    {
        $this->endTime = $endTime;

        return $this;
    }

    /**
     * Get endTime
     *
     * @return \DateTime 
     */
    public function getEndTime()
    {
        return $this->endTime;
    }

    /**
     * Set startDate
     *
     * @param \DateTime $startDate
     * @return Publication
     */
    public function setStartDate($startDate)
    {
        $this->startDate = $startDate;

        return $this;
    }

    /**
     * Get startDate
     *
     * @return \DateTime 
     */
    public function getStartDate()
    {
        return $this->startDate;
    }

    /**
     * Set endDate
     *
     * @param \DateTime $endDate
     * @return Publication
     */
    public function setEndDate($endDate)
    {
        $this->endDate = $endDate;

        return $this;
    }

    /**
     * Get endDate
     *
     * @return \DateTime 
     */
    public function getEndDate()
    {
        return $this->endDate;
    }

    /**
     * Set inTransmission
     *
     * @param boolean $inTransmission
     * @return Publication
     */
    public function setInTransmission($inTransmission)
    {
        $this->inTransmission = $inTransmission;

        return $this;
    }

    /**
     * Get inTransmission
     *
     * @return boolean 
     */
    public function getInTransmission()
    {
        return $this->inTransmission;
    }
}
