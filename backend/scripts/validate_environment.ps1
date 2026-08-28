$ErrorActionPreference = "SilentlyContinue"

function Write-Result {
    param([string]$name, [string]$status)
    Write-Host ("{0,-30} : {1}" -f $name, $status)
}

Write-Host "--- PRICING_LOGISTICS ENVIRONMENT VALIDATION ---"

# Git
if (Get-Command git -ErrorAction SilentlyContinue) { Write-Result "Git" "PASS" } else { Write-Result "Git" "FAIL" }

# GitHub CLI
if (Get-Command gh -ErrorAction SilentlyContinue) { Write-Result "GitHub CLI" "PASS" } else { Write-Result "GitHub CLI" "FAIL" }

# Python 3.13
$py313 = py -3.13 --version 2>&1
if ($py313 -match "Python 3.13") { Write-Result "Python 3.13.x" "PASS" } else { Write-Result "Python 3.13.x" "FAIL" }

# .venv and pip
if (Test-Path ".\.venv\Scripts\python.exe") {
    Write-Result ".venv exists" "PASS"
    $pipVersion = & ".\.venv\Scripts\python.exe" -m pip --version
    if ($pipVersion -match "pip") { Write-Result ".venv pip" "PASS" } else { Write-Result ".venv pip" "FAIL" }
} else {
    Write-Result ".venv exists" "FAIL"
    Write-Result ".venv pip" "FAIL"
}

# PostgreSQL 17 Service
$pgService = Get-Service *postgres* -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "17" }
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Result "PostgreSQL 17 Service" "PASS"
} else {
    Write-Result "PostgreSQL 17 Service" "FAIL"
}

# psql client
if (Test-Path "C:\Program Files\PostgreSQL\17\bin\psql.exe") {
    Write-Result "psql client" "PASS"
} else {
    Write-Result "psql client" "FAIL"
}

# Databases
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match "^([A-Za-z0-9_]+)=(.*)$" } | ForEach-Object {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

if (Test-Path ".\.venv\Scripts\python.exe") {
    $devConn = & ".\.venv\Scripts\python.exe" -c "import psycopg, os; psycopg.connect(dbname=os.environ.get('DATABASE_NAME', 'pricing_logistics_dev'), user=os.environ.get('DATABASE_USER', 'pricing_logistics_app'), password=os.environ.get('DATABASE_PASSWORD', ''), host=os.environ.get('DATABASE_HOST', '127.0.0.1'), port=os.environ.get('DATABASE_PORT', '5432')).close(); print('PASS')" 2>&1
    if ($devConn -eq "PASS") { Write-Result "Development DB Connectivity" "PASS" } else { Write-Result "Development DB Connectivity" "FAIL" }

    $testConn = & ".\.venv\Scripts\python.exe" -c "import psycopg, os; psycopg.connect(dbname=os.environ.get('TEST_DATABASE_NAME', 'pricing_logistics_test'), user=os.environ.get('DATABASE_USER', 'pricing_logistics_app'), password=os.environ.get('DATABASE_PASSWORD', ''), host=os.environ.get('DATABASE_HOST', '127.0.0.1'), port=os.environ.get('DATABASE_PORT', '5432')).close(); print('PASS')" 2>&1
    if ($testConn -eq "PASS") { Write-Result "Test DB Connectivity" "PASS" } else { Write-Result "Test DB Connectivity" "FAIL" }
}

# Django
if (Test-Path ".\.venv\Scripts\python.exe") {
    $django = & ".\.venv\Scripts\python.exe" -m django --version 2>&1
    if ($django -match "5\.2") { Write-Result "Django 5.2.x" "PASS" } else { Write-Result "Django 5.2.x" "FAIL ($django)" }
}

# psycopg
if (Test-Path ".\.venv\Scripts\python.exe") {
    $psycopg = & ".\.venv\Scripts\python.exe" -c "import psycopg; print('PASS')" 2>&1
    if ($psycopg -eq "PASS") { Write-Result "psycopg" "PASS" } else { Write-Result "psycopg" "FAIL" }
}

# Selenium
if (Test-Path ".\.venv\Scripts\python.exe") {
    $selenium = & ".\.venv\Scripts\python.exe" -c "import selenium; print('PASS')" 2>&1
    if ($selenium -eq "PASS") { Write-Result "Selenium" "PASS" } else { Write-Result "Selenium" "FAIL" }
}

Write-Host "------------------------------------------------"
