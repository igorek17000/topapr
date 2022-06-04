CREATE TABLE `tokenprice` (
  `address` varchar(45) NOT NULL,
  `network` varchar(45) NOT NULL,
  `price` double DEFAULT NULL,
  `openprice` double DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`address`,`network`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
