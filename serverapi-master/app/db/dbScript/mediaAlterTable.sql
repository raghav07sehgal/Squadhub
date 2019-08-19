ALTER TABLE `squadhubdb`.`managementusers` 
DROP COLUMN `locationId`;


ALTER TABLE `squadhubdb`.`users` 
ADD COLUMN `locationId` INT(111) NULL COMMENT '' AFTER `towerId`;
