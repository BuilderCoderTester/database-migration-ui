-- Migration: create_table_employee
-- Version: 003

-- Write your UP SQL here
create table employee(
    emp_id int ,
    emp_nmae varchar(12)
);

-- DOWN

-- Write your DOWN SQL here
drop table employee;