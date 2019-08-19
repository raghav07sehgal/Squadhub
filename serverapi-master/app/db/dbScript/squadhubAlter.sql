ALTER TABLE `squadhubdb`.`project` 
CHANGE COLUMN `budgetedEffort` `budgetedEffort` INT(111) NULL COMMENT '' AFTER `projectName`;


ALTER TABLE `squadhubdb`.`project` 
ADD COLUMN `changeRequestHours` BIGINT(20) NULL COMMENT '' AFTER `budgetedEffort`;

ALTER TABLE `squadhubdb`.`userhistory` 
CHANGE COLUMN `employeeCode` `employeeCode` VARCHAR(45) NULL DEFAULT NULL COMMENT '' ;
