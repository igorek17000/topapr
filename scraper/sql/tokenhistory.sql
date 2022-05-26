CREATE TABLE `tokenhistory` (
  `address` varchar(45) NOT NULL,
  `network` varchar(45) NOT NULL,
  `date` datetime NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`address`,`network`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
