CREATE TABLE `farms` (
  `pair` varchar(45) NOT NULL,
  `pool` varchar(45) NOT NULL,
  `network` varchar(45) DEFAULT NULL,
  `apr` double DEFAULT NULL,
  `totalValue` bigint DEFAULT NULL,
  `multiplier` double DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`pair`,`pool`)
)