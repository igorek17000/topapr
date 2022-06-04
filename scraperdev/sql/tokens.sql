CREATE TABLE `tokens` (
  `name` varchar(45) NOT NULL,
  `network` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `fullname` varchar(1023) DEFAULT NULL,
  `decimals` int DEFAULT NULL,
  `site` varchar(1023) DEFAULT NULL,
  `socials` text,
  `tags` varchar(1023) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `pricechange` double DEFAULT NULL,
  `marketcap` double DEFAULT NULL,
  `totalsupply` double DEFAULT NULL,
  `currenttotalsupply` double DEFAULT NULL,
  `holders` int DEFAULT NULL,
  `transfers` int DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`name`,`network`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DELETE FROM `topapr`.`tokens` WHERE (`name` = 'RACA') and (`network` = 'BSC');
DELETE FROM `topapr`.`tokens` WHERE (`name` = 'SLC') and (`network` = 'Solana');
DELETE FROM `topapr`.`tokens` WHERE (`name` = 'ATS') and (`network` = 'Solana');
DELETE FROM `topapr`.`tokens` WHERE (`name` = 'SOL') and (`network` = 'Solana');
DELETE FROM `topapr`.`tokens` WHERE (`name` = 'USDT') and (`network` = 'Avalanche');

ALTER TABLE `topapr`.`tokens` 
CHANGE COLUMN `address` `address` VARCHAR(45) NOT NULL FIRST,
CHANGE COLUMN `network` `network` VARCHAR(45) NOT NULL AFTER `address`,
DROP PRIMARY KEY,
ADD PRIMARY KEY (`network`, `address`);
;
