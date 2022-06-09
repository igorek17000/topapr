CREATE TABLE `starred` (
  `userid` varchar(45) NOT NULL,
  `pair` varchar(45) NOT NULL,
  `pool` varchar(45) NOT NULL,
  `network` varchar(45) NOT NULL,
  PRIMARY KEY (`userid`,`pair`,`pool`,`network`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
