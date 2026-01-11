-- Add process and developed columns to projects table
ALTER TABLE projects ADD COLUMN process TEXT; -- JSON array
ALTER TABLE projects ADD COLUMN process_ko TEXT; -- JSON array
ALTER TABLE projects ADD COLUMN developed TEXT; -- JSON array
ALTER TABLE projects ADD COLUMN developed_ko TEXT; -- JSON array
