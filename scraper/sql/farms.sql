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

ALTER TABLE `farms` 
ADD COLUMN `apy` DOUBLE NULL AFTER `apr`;

#####################

ALTER TABLE `farms` 
DROP PRIMARY KEY,
ADD PRIMARY KEY (`pair`, `pool`, `network`);
;

update `farms` set pool = 'Mdex' where pool = 'Mdex-BSC' and pair != '' and network != '';
update `farms` set pool = 'Mdex' where pool = 'Mdex-Heco' and pair != '' and network != '';
