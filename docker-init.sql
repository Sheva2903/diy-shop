-- Initialize diyshop user and database
CREATE USER diyshop WITH PASSWORD 'diyshop123' SUPERUSER CREATEDB;
CREATE DATABASE diyshop OWNER diyshop;
GRANT ALL PRIVILEGES ON DATABASE diyshop TO diyshop;
