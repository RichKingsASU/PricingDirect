# Pricing_Logistics Local Development Setup

## Approved Stack
- **Python**: 3.13.x (Minimum 3.13.5)
- **Framework**: Django 5.2.x LTS
- **Database**: PostgreSQL 17.x
- **Browser Testing**: Selenium (Google Chrome / Microsoft Edge)

## Windows Prerequisites
Ensure the following tools are installed and available on your PATH:
- Git
- GitHub CLI (`gh`)
- Python 3.13
- PostgreSQL 17
- Google Chrome
- PowerShell 7 (Optional but recommended)

## Repository Cloning
```powershell
git clone https://github.com/RichKingsASU/Pricing_Logistics.git
cd Pricing_Logistics
```

## Virtual Environment Setup
Create a dedicated, isolated Python 3.13 virtual environment:
```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

## Dependency Installation
Install the governed baseline requirements (Django, psycopg, Selenium):
```powershell
python -m pip install "Django>=5.2,<5.3" psycopg[binary] selenium
```

## PostgreSQL 17 Setup
Ensure the PostgreSQL 17 Windows service is running:
- **Service Name**: `postgresql-x64-17`
- **Binary Location**: `C:\Program Files\PostgreSQL\17\bin`
- **Port**: 5432

### PATH Setup
Ensure `C:\Program Files\PostgreSQL\17\bin` is added to your User or System PATH to use `psql` globally.

### Database and Roles
Create the required database and user roles (Requires PostgreSQL Administrator permissions):
```sql
CREATE ROLE pricing_logistics_app WITH LOGIN PASSWORD 'YOUR_SECURE_PASSWORD';
CREATE DATABASE pricing_logistics_dev OWNER pricing_logistics_app;
CREATE DATABASE pricing_logistics_test OWNER pricing_logistics_app;
```

### Password Reset Guidance
If you lose the PostgreSQL `postgres` administrator password:
1. Stop the `postgresql-x64-17` service.
2. Edit `C:\Program Files\PostgreSQL\17\data\pg_hba.conf` and change the local `scram-sha-256` rules to `trust`.
3. Start the service.
4. Run `psql -U postgres -d postgres -c "ALTER USER postgres PASSWORD 'NEW_PASSWORD';"`
5. Revert `pg_hba.conf` back to `scram-sha-256` and restart the service.

## Environment Configuration
Protect your secrets. Create a `.env` file in the repository root. Never commit `.env` to version control.
Populate your `.env` with the following variables:
```
DATABASE_NAME=pricing_logistics_dev
DATABASE_USER=pricing_logistics_app
DATABASE_PASSWORD=YOUR_SECURE_PASSWORD
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
TEST_DATABASE_NAME=pricing_logistics_test
```

## Connectivity Validation
Verify your database connectivity independently from Django using `psycopg`:
```powershell
python -c "import psycopg, os; psycopg.connect(dbname=os.environ.get('DATABASE_NAME', 'pricing_logistics_dev'), user=os.environ.get('DATABASE_USER', 'pricing_logistics_app'), password=os.environ.get('DATABASE_PASSWORD', ''), host=os.environ.get('DATABASE_HOST', '127.0.0.1'), port=os.environ.get('DATABASE_PORT', '5432')).close(); print('Connected to Dev DB Successfully')"
```

## Selenium Testing Setup
Selenium and drivers are managed via Selenium Manager. Run the smoke test to validate browser automation:
```powershell
python scripts\selenium_smoke_test.py
```

## Environment Validation
Run the provided validation script to ensure your environment meets all requirements:
```powershell
.\scripts\validate_environment.ps1
```
