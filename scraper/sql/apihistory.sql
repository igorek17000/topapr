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

ALTER TABLE `aprhistory` 
ADD COLUMN `network` VARCHAR(45) NULL AFTER `pool`;

ALTER TABLE `aprhistory` 
DROP INDEX `PairPool` ,
ADD INDEX `PairPool` (`pair` ASC, `pool` ASC, `network` ASC, `date` ASC) VISIBLE;
;

update `aprhistory` set network = 'BSC' where pool = 'Mdex-BSC' and id <> 0;
update `aprhistory` set pool = 'Mdex' where pool = 'Mdex-BSC' and id <> 0;
update `aprhistory` set network = 'Heco' where pool = 'Mdex-Heco' and id <> 0;
update `aprhistory` set pool = 'Mdex' where pool = 'Mdex-Heco' and id <> 0;
update `aprhistory` set network = 'BSC' where pool = 'PancakeSwap' and id <> 0;
update `aprhistory` set network = 'BSC' where pool = 'Biswap' and id <> 0;
update `aprhistory` set network = 'Avalanche' where pool = 'Pangolin' and id <> 0;
update `aprhistory` set network = 'Solana' where pool = 'Raydium' and id <> 0;
update `aprhistory` set network = 'SpookySwap' where pool = 'Fantom' and id <> 0;
update `aprhistory` set network = 'Sushi' where pool = 'ETH' and id <> 0;
update `aprhistory` set network = 'Avalanche' where pool = 'TraderJoe' and id <> 0;
