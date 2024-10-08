-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: datospacientemed
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `pendientes`
--

DROP TABLE IF EXISTS `pendientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pendientes` (
  `idpendientes` int NOT NULL AUTO_INCREMENT,
  `numerofactura` int NOT NULL,
  `fecharegistro` date NOT NULL,
  `identificacion` int NOT NULL,
  `tipoidentificacion` varchar(45) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `celular` varchar(10) NOT NULL,
  `celular2` varchar(10) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `codigoproducto` int NOT NULL,
  `medicamento` varchar(150) NOT NULL,
  `tipoproducto` varchar(45) NOT NULL,
  `laboratorio` varchar(100) NOT NULL,
  `cobertura` varchar(45) NOT NULL,
  `cantidadprescrita` int NOT NULL,
  `cantidadpendiente` int NOT NULL,
  `cantidadentregada` int DEFAULT NULL,
  `cantidadentregada1` int DEFAULT NULL,
  `fechaentrega1` date DEFAULT NULL,
  `cantidadentregada2` int DEFAULT NULL,
  `fechaentrega2` date DEFAULT NULL,
  `cantidadentregada3` int DEFAULT NULL,
  `fechaentrega3` date DEFAULT NULL,
  `cantidadentregada4` int DEFAULT NULL,
  `fechaentrega4` date DEFAULT NULL,
  `cantidadentregada5` int DEFAULT NULL,
  `fechaentrega5` date DEFAULT NULL,
  `cantidadentregada6` int DEFAULT NULL,
  `fechaentrega6` date DEFAULT NULL,
  `cantidadentregada7` int DEFAULT NULL,
  `fechaentrega7` date DEFAULT NULL,
  `cantidadentregada8` int DEFAULT NULL,
  `fechaentrega8` date DEFAULT NULL,
  `cantidadentregada9` int DEFAULT NULL,
  `fechaentrega9` date DEFAULT NULL,
  `cantidadentregada10` int DEFAULT NULL,
  `fechaentrega10` date DEFAULT NULL,
  `cantidadpendientefinal` int DEFAULT NULL,
  `tipoentrega` varchar(45) NOT NULL,
  `sedependiente` varchar(100) NOT NULL,
  `estadodispensacion` varchar(45) NOT NULL,
  `numeroformula` varchar(45) NOT NULL,
  `cum` varchar(45) DEFAULT NULL,
  `ambito` varchar(45) NOT NULL,
  `nitips` varchar(45) NOT NULL,
  `nombreips` varchar(45) NOT NULL,
  `tipocontrato` varchar(45) NOT NULL,
  `codigodiagnostico` varchar(45) NOT NULL,
  `diagnostico` varchar(300) NOT NULL,
  `plansos` varchar(45) NOT NULL,
  `fechaformula` date NOT NULL,
  `concentracion` varchar(100) DEFAULT NULL,
  `observacion` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`idpendientes`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pendientes`
--

LOCK TABLES `pendientes` WRITE;
/*!40000 ALTER TABLE `pendientes` DISABLE KEYS */;
INSERT INTO `pendientes` VALUES (1,1,'2024-10-01',31834169,'CC','VILLADA VELASQUEZ MIRYAM ','3013437735','3152011111','manzana 12',30010119,'ENJUAGUE BUCAL CUIDADO TOTAL LISTERINE FCO X 500ML','ASEO Y LIMPIEZA','J&J','NOPBS',3,100,75,1,NULL,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,25,'Domicilio','morichal','Pendiente','111','98714','Ambulatorio','589','emssa','S','z000','EXAMEN MEDICO GENERAL','pos','2024-10-01','100ml',NULL),(2,2,'2024-10-01',31834169,'CC','VILLADA VELASQUEZ MIRYAM ','3013437735','25596444','manzana13',11020197,'PEPTAMEN PREBIO 1 INST FCO X 250ML VAINILLA','ALIMENTOS','BOYDORR','NOPBS',20,500,56,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,444,'Presencial','tequendama','Pendiente','36','556194','Ambulatorio','200','loooo','C','a001','COLERA DEBIDO A VIBRIO CHOLERAE 01- BIOTIPO EL TOR','pos','2024-10-02','100ml',NULL),(3,2,'2024-10-01',31834169,'CC','VILLADA VELASQUEZ MIRYAM ','3013437735','25596444','manzana13',11020173,'HCYS MED B TAR X 500GR','ALIMENTOS','ABBOTT','NOPBS',30,1000,32,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,968,'Presencial','tequendama','Pendiente','36','138731','Ambulatorio','200','loooo','C','a001','COLERA DEBIDO A VIBRIO CHOLERAE 01- BIOTIPO EL TOR','pos','2024-10-02','100ml',NULL),(4,3,'2024-10-01',31834169,'CC','VILLADA VELASQUEZ MIRYAM ','3013437735','2132511','adssd',30020042,'NOVASOURCE PROLINE 1.4KCL/ML INST FCO X 200ML VAINILLA','ASEO Y LIMPIEZA','NESTLE','NOPBS',60,0,100,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'Domicilio','tequendama','Pendiente','21251','556365','Ambulatorio','2112','sd','C','a001','COLERA DEBIDO A VIBRIO CHOLERAE 01- BIOTIPO EL TOR','pos','2024-10-01','100ml',NULL),(5,4,'2024-10-02',1111694094,'TI','GERENA DUARTE DILAN STEVEN','3158957317','234234','vfffff',20020398,'SONDA FOLEY 2 VIAS REF 7-6505-22 SOB X 1 SUNMED 5CCX22FR','DISPOSITIVO MEDICO','LIFE CARE','PBS',55,50,50,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'Presencial','tequendama','Pendiente','434','20085432','Ambulatorio','4234','pas','C','a001','COLERA DEBIDO A VIBRIO CHOLERAE 01- BIOTIPO EL TOR','pos','2024-10-02','200',NULL),(6,5,'2024-10-04',1111694094,'TI','GERENA DUARTE DILAN STEVEN','3158957317','32555','plplpl',30020034,'INMUNEX BOL X 131GR PLUS VAINILLA LATE','ASEO Y LIMPIEZA','MEGALABS','NOPBS',100,60,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,60,'Presencial','tequendama','Pendiente','333','166400','Ambulatorio','151','sss','C','z000','EXAMEN MEDICO GENERAL','pos','2024-10-04','100ml',NULL);
/*!40000 ALTER TABLE `pendientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-07 23:33:09
