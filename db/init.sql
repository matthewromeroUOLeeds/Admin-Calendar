CREATE DATABASE  IF NOT EXISTS `admin_panel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `admin_panel`;
-- MySQL dump 10.13  Distrib 8.0.36, for macos14 (x86_64)
--
-- Host: 127.0.0.1    Database: admin_panel
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `Classes`
--

DROP TABLE IF EXISTS `Classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Classes` (
  `classID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `teacherID` int NOT NULL,
  `color` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`classID`),
  UNIQUE KEY `classID_UNIQUE` (`classID`),
  KEY `teacherID_idx` (`teacherID`),
  CONSTRAINT `teacherID` FOREIGN KEY (`teacherID`) REFERENCES `Teachers` (`teacherID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Classes`
--

LOCK TABLES `Classes` WRITE;
/*!40000 ALTER TABLE `Classes` DISABLE KEYS */;
INSERT INTO `Classes` VALUES (1,'Salsa beginners',3,'#8A2BE2'),(2,'Tango',2,'#F0F8FF'),(3,'Modern',4,'#7CFC00'),(4,'Bachata',2,'#FF6347'),(5,'Kids',1,'#FF7F50');
/*!40000 ALTER TABLE `Classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ClassesTaken`
--

DROP TABLE IF EXISTS `ClassesTaken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ClassesTaken` (
  `takenID` int NOT NULL AUTO_INCREMENT,
  `takenStudentID` int NOT NULL,
  `takenClassID` int NOT NULL,
  PRIMARY KEY (`takenID`),
  KEY `takenStudentID_idx` (`takenStudentID`),
  KEY `takenClassID_idx` (`takenClassID`),
  CONSTRAINT `takenClassID` FOREIGN KEY (`takenClassID`) REFERENCES `Classes` (`classID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `takenStudentID` FOREIGN KEY (`takenStudentID`) REFERENCES `Students` (`studentID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ClassesTaken`
--

LOCK TABLES `ClassesTaken` WRITE;
/*!40000 ALTER TABLE `ClassesTaken` DISABLE KEYS */;
INSERT INTO `ClassesTaken` VALUES (1,4,4),(2,36,4),(3,14,4),(4,16,4),(5,5,4),(6,19,4),(7,12,3),(8,12,2),(9,10,2),(10,5,2),(11,24,2),(12,41,1),(13,2,1),(14,43,1),(15,50,5),(16,6,5),(17,23,5),(18,9,1);
/*!40000 ALTER TABLE `ClassesTaken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schedule`
--

DROP TABLE IF EXISTS `Schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Schedule` (
  `scheduleID` int NOT NULL AUTO_INCREMENT,
  `scheduleClassID` int NOT NULL,
  `day` int NOT NULL,
  `startTime` int NOT NULL,
  `endTime` int NOT NULL,
  `room` int NOT NULL,
  PRIMARY KEY (`scheduleID`),
  UNIQUE KEY `scheduleID_UNIQUE` (`scheduleID`),
  KEY `scheduleClassID_idx` (`scheduleClassID`),
  CONSTRAINT `scheduleClassID` FOREIGN KEY (`scheduleClassID`) REFERENCES `Classes` (`classID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schedule`
--

LOCK TABLES `Schedule` WRITE;
/*!40000 ALTER TABLE `Schedule` DISABLE KEYS */;
INSERT INTO `Schedule` VALUES (1,3,1,19,21,1),(2,3,3,17,19,1),(3,2,5,0,3,1),(4,4,0,12,14,2),(5,1,0,15,17,3),(6,1,2,18,20,3),(7,5,5,15,17,2);
/*!40000 ALTER TABLE `Schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Students`
--

DROP TABLE IF EXISTS `Students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Students` (
  `studentID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`studentID`),
  UNIQUE KEY `student_id_UNIQUE` (`studentID`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Students`
--

LOCK TABLES `Students` WRITE;
/*!40000 ALTER TABLE `Students` DISABLE KEYS */;
INSERT INTO `Students` VALUES (1,'Constantine','McCorry','cmccorry0@constantcontact.com'),(2,'Trula','Milsted','tmilsted1@instagram.com'),(3,'Catherina','Armitage','carmitage2@last.fm'),(4,'Genevieve','Olyfant','golyfant3@businessinsider.com'),(5,'Fidelio','Lippingwell','flippingwell4@dailymail.co.uk'),(6,'Jennine','Wortt','jwortt5@php.net'),(7,'Frants','Limer','flimer6@pbs.org'),(8,'Aloysia','Gorling','agorling7@spotify.com'),(9,'Scotty','Spaducci','sspaducci8@sina.com.cn'),(10,'Netta','Raffin','nraffin9@sakura.ne.jp'),(11,'Elysha','Persich','epersicha@gov.uk'),(12,'Taylor','Gilberthorpe','tgilberthorpeb@slashdot.org'),(13,'Lizzie','Brimner','lbrimnerc@typepad.com'),(14,'Libbey','Mechell','lmechelld@github.io'),(15,'Thorin','Foord','tfoorde@irs.gov'),(16,'Queenie','McVanamy','qmcvanamyf@sina.com.cn'),(17,'Carr','Butterwick','cbutterwickg@skype.com'),(18,'Sybyl','Webben','swebbenh@google.ru'),(19,'Ernaline','Westrope','ewestropei@tinyurl.com'),(20,'Stefa','Durand','sdurandj@ibm.com'),(21,'Michal','Battabee','mbattabeek@tinyurl.com'),(22,'Aubree','Battram','abattraml@cornell.edu'),(23,'Elwood','Wright','ewrightm@army.mil'),(24,'Rowland','Illsley','rillsleyn@barnesandnoble.com'),(25,'Haroun','Savory','hsavoryo@purevolume.com'),(26,'Jeffrey','Lucy','jlucyp@cisco.com'),(27,'Ashlen','Kellitt','akellittq@ebay.com'),(28,'Hamil','Gounin','hgouninr@wiley.com'),(29,'Cristal','Cudbird','ccudbirds@etsy.com'),(30,'Dwayne','Clute','dclutet@webs.com'),(31,'Stevie','Favelle','sfavelleu@gov.uk'),(32,'Ely','Tames','etamesv@edublogs.org'),(33,'Kiersten','Durno','kdurnow@so-net.ne.jp'),(34,'Dallas','Fairbanks','dfairbanksx@paypal.com'),(35,'Madlin','Kilbride','mkilbridey@edublogs.org'),(36,'Garv','Follen','gfollenz@senate.gov'),(37,'Sherwin','Hubbis','shubbis10@jugem.jp'),(38,'Edgard','Mouland','emouland11@wix.com'),(39,'Elmer','Storrier','estorrier12@addthis.com'),(40,'Giovanni','Calender','gcalender13@imdb.com'),(41,'Lory','McCoole','lmccoole14@shop-pro.jp'),(42,'Esteban','Goodge','egoodge15@microsoft.com'),(43,'Easter','Lynthal','elynthal16@blinklist.com'),(44,'Jeanie','Aguirrezabala','jaguirrezabala17@rediff.com'),(45,'Jamaal','Lembrick','jlembrick18@dion.ne.jp'),(46,'Aime','Gerhartz','agerhartz19@cam.ac.uk'),(47,'Kassie','Warret','kwarret1a@cisco.com'),(48,'Perle','Yushankin','pyushankin1b@wufoo.com'),(49,'Mollee','Renouf','mrenouf1c@51.la'),(50,'Giorgio','Meaddowcroft','gmeaddowcroft1d@tuttocitta.it');
/*!40000 ALTER TABLE `Students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Teachers`
--

DROP TABLE IF EXISTS `Teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teachers` (
  `teacherID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`teacherID`),
  UNIQUE KEY `teacherID_UNIQUE` (`teacherID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Teachers`
--

LOCK TABLES `Teachers` WRITE;
/*!40000 ALTER TABLE `Teachers` DISABLE KEYS */;
INSERT INTO `Teachers` VALUES (1,'Steffi','Creavan','screavan0@studiopress.com'),(2,'Christyna','McPolin','cmcpolin1@msu.edu'),(3,'Fitzgerald','Well','fwell2@quantcast.com'),(4,'Blinni','Bjerkan','bbjerkan3@zdnet.com');
/*!40000 ALTER TABLE `Teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-10  9:22:42
