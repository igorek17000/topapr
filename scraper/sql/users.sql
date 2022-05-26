CREATE TABLE `users` (
  `id` varchar(45) NOT NULL,
  `nonce` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
)