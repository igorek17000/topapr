CREATE TABLE `mexc` (
  `token` varchar(45) NOT NULL,
  `tokenName` varchar(45) DEFAULT NULL,
  `leverageLimit` varchar(45) DEFAULT NULL,
  `desc` text,
  `tokenAmount` bigint DEFAULT NULL,
  PRIMARY KEY (`token`)
)