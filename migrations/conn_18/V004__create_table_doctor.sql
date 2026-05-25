-- Migration: create_table_doctor
-- Version: 004

-- Write your UP SQL here
create table Doctor(
    doc_id int ,
    doc_name varchar(12)
);

-- DOWN

-- Write your DOWN SQL here
drop table Doctor;