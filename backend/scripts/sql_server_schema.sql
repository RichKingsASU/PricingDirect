-- scripts/sql_server_schema.sql
-- Run to create the PricingLogisticsMigration database

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PricingLogisticsMigration')
BEGIN
    CREATE DATABASE PricingLogisticsMigration;
END
GO

USE PricingLogisticsMigration;
GO

IF OBJECT_ID('rates_customerratelane', 'U') IS NOT NULL DROP TABLE rates_customerratelane;
IF OBJECT_ID('pricing_marketsummary', 'U') IS NOT NULL DROP TABLE pricing_marketsummary;
IF OBJECT_ID('pricing_laneexception', 'U') IS NOT NULL DROP TABLE pricing_laneexception;
IF OBJECT_ID('pricing_pricingadjustment', 'U') IS NOT NULL DROP TABLE pricing_pricingadjustment;
GO

-- rates_customerratelane
CREATE TABLE rates_customerratelane (
    id INT PRIMARY KEY,
    lane_id NVARCHAR(100) NOT NULL UNIQUE,
    customer_name NVARCHAR(200) NOT NULL,
    origin_city NVARCHAR(100) NOT NULL,
    origin_state NVARCHAR(2) NOT NULL,
    raw_origin NVARCHAR(200) NOT NULL,
    destination_city NVARCHAR(100) NOT NULL,
    destination_state NVARCHAR(2) NOT NULL,
    raw_destination NVARCHAR(200) NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL,
    equipment NVARCHAR(100) NOT NULL,
    service_type NVARCHAR(100) NOT NULL,
    miles INT NOT NULL,
    status NVARCHAR(20) NOT NULL,
    active_state NVARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    review_date DATE NULL,
    fuel_surcharge_percent DECIMAL(5, 2) NOT NULL,
    fuel_amount DECIMAL(10, 2) NOT NULL,
    total_billing DECIMAL(10, 2) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL,
    updated_at DATETIMEOFFSET NOT NULL,
    created_by_id INT NULL,
    updated_by_id INT NULL,
    CONSTRAINT chk_rates_base_rate CHECK (base_rate >= 0),
    CONSTRAINT chk_rates_miles CHECK (miles >= 0)
);

-- pricing_marketsummary
CREATE TABLE pricing_marketsummary (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    region NVARCHAR(10) NOT NULL,
    avg_actual DECIMAL(10, 2) NOT NULL,
    avg_target DECIMAL(10, 2) NOT NULL,
    variance_dollars DECIMAL(10, 2) NOT NULL,
    variance_percent DECIMAL(5, 2) NOT NULL,
    loads INT NOT NULL,
    trend_status NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL,
    updated_at DATETIMEOFFSET NOT NULL,
    created_by_id INT NULL,
    updated_by_id INT NULL
);

-- pricing_laneexception
CREATE TABLE pricing_laneexception (
    id INT PRIMARY KEY,
    origin NVARCHAR(100) NOT NULL,
    destination NVARCHAR(100) NOT NULL,
    market NVARCHAR(10) NOT NULL,
    loads INT NOT NULL,
    current_target DECIMAL(10, 2) NOT NULL,
    avg_actual DECIMAL(10, 2) NOT NULL,
    var_dollars DECIMAL(10, 2) NOT NULL,
    var_percent DECIMAL(5, 2) NOT NULL,
    confidence NVARCHAR(20) NOT NULL,
    impact NVARCHAR(20) NOT NULL,
    adjustment_status NVARCHAR(50) NULL,
    last_adjusted_target DECIMAL(10, 2) NULL,
    adjusted_date DATE NULL,
    adjusted_notes NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET NOT NULL,
    updated_at DATETIMEOFFSET NOT NULL,
    created_by_id INT NULL,
    updated_by_id INT NULL
);

-- pricing_pricingadjustment
CREATE TABLE pricing_pricingadjustment (
    id INT PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    change_percent DECIMAL(5, 2) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    effective_date DATE NOT NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET NOT NULL,
    updated_at DATETIMEOFFSET NOT NULL,
    created_by_id INT NULL,
    updated_by_id INT NULL,
    CONSTRAINT chk_pricing_change_percent CHECK (change_percent >= -100)
);
GO
