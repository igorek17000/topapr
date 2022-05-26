CREATE TABLE `aprhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pair` varchar(45) NOT NULL,
  `pool` varchar(45) NOT NULL,
  `apr` double NOT NULL,
  `totalValue` bigint DEFAULT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PairPool` (`pair`,`pool`,`date` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci