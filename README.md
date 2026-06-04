# HealthGuard Platform

HealthGuard is a university health monitoring platform built with:

- ASP.NET Core Web API (.NET 8)
- Entity Framework Core and Microsoft SQL Server
- Redis NoSQL cache and real-time support store
- React, TypeScript, and Vite
- JWT authentication with refresh tokens
- SignalR real-time notifications
- Existing Python ML prediction API integration

The ML notebook, trained model files, scaler files, datasets, and prediction integration are intentionally kept unchanged.

## Project Structure

- `backend/HealthGuard.API` - ASP.NET Core API, EF Core models, controllers, services, migrations
- `frontend` - React + Vite application
- `ml` - existing machine learning notebook, dataset, trained model files, results, and prediction API
- `docs` - supporting project documentation

## Backend Setup

1. Install .NET 8 SDK and SQL Server.
2. Configure the database connection with an environment variable or user secret:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=HealthGuardDb;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;" --project backend/HealthGuard.API
```

3. Configure JWT and CORS values where possible through environment configuration:

```powershell
dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-secret-at-least-32-chars" --project backend/HealthGuard.API
dotnet user-secrets set "Cors:AllowedOrigins:0" "http://localhost:5173" --project backend/HealthGuard.API
dotnet user-secrets set "MlApi:BaseUrl" "http://localhost:8000" --project backend/HealthGuard.API
```

4. Run Redis locally with Docker:

```powershell
docker run --name healthguard-redis -p 6379:6379 -d redis
```

Configure Redis with either an environment variable or a user secret:

```powershell
$env:REDIS_CONNECTION = "localhost:6379"
dotnet user-secrets set "REDIS_CONNECTION" "localhost:6379" --project backend/HealthGuard.API
```

5. Run the API:

```powershell
dotnet run --project backend/HealthGuard.API
```

The API applies EF Core migrations on startup and seeds the admin account.

## Database and Migrations

Microsoft SQL Server remains the authoritative relational database for all users, roles, health records, predictions, symptoms, reports, notifications, settings, and other domain entities. The existing `HealthGuardDb` schema and EF Core migrations remain unchanged.

Redis is the platform's NoSQL integration. It is used only for:

- Five-minute user and admin dashboard summary caches
- Per-user unread notification counts
- Five-minute per-user prediction history caches
- Fast cache reads with automatic fallback to MSSQL

Redis unavailability does not replace or interrupt MSSQL persistence. Redis errors are logged, cache reads fall back to SQL queries, and API requests continue using the relational database.

Required backend environment variables:

```text
ConnectionStrings__DefaultConnection=Server=localhost;Database=HealthGuardDb;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;
REDIS_CONNECTION=localhost:6379
Jwt__Key=replace-with-a-long-random-secret-at-least-32-chars
```

The database includes authentication, authorization, audit, notification, reporting, import/export, and health domain tables. Mandatory tables added include:

- `Roles`
- `UserRoles`
- `Permissions`
- `RolePermissions`
- `RefreshTokens`
- `AuditLogs`
- `Settings`
- `Files`

Additional domain tables bring the schema above 24 tables, including patient profiles, medications, allergies, appointments, report definitions, generated reports, report exports, import batches, and export jobs.

Create a new migration after model changes:

```powershell
dotnet ef migrations add MigrationName --project backend/HealthGuard.API
```

Apply migrations manually if needed:

```powershell
dotnet ef database update --project backend/HealthGuard.API
```

## Redis / NoSQL Integration

Redis is the NoSQL database used as a cache layer. SQL Server remains the source of truth, and no application data is stored only in Redis.

The backend uses `StackExchange.Redis` through dependency injection and the `IRedisCacheService` abstraction. Cached values are serialized as JSON. The cache service supports:

- `SetAsync` to store an object with an optional expiration
- `GetAsync` to deserialize a cached object
- `RemoveAsync` to invalidate a cache entry

Redis is used by these modules:

- Dashboard: user and admin dashboard statistics are cached for five minutes. A cache miss loads the data from SQL Server and stores the result in Redis.
- Notifications: unread counts are cached per user. The count and affected user dashboard cache are invalidated whenever a notification is created or marked as read.
- Predictions: each user's prediction history is cached for five minutes. After a new prediction is committed to SQL Server, the history cache is rebuilt and dashboard caches are invalidated.

Redis failures are logged and treated as cache misses. Reads continue from SQL Server, and failed cache writes or invalidations do not fail the API request.

Copy the backend environment template and configure the connection:

```powershell
Copy-Item backend/HealthGuard.API/.env.example backend/HealthGuard.API/.env
```

```text
REDIS_CONNECTION=localhost:6379
```

Run Redis locally with Docker:

```powershell
docker run --name healthguard-redis -p 6379:6379 -d redis:7-alpine
```

For an existing stopped container:

```powershell
docker start healthguard-redis
```

The API defaults to `localhost:6379` when `REDIS_CONNECTION` is not set. The legacy `Redis__ConnectionString` configuration key is also accepted for compatibility.

## Frontend Setup

1. Install Node.js.
2. Install dependencies:

```powershell
cd frontend
npm install
```

3. Run Vite:

```powershell
npm run dev
```

Vite proxies `/api` and `/hubs` to the backend target configured by `VITE_API_PROXY_TARGET` or `http://localhost:5000`.

## Machine Learning Setup

The ML work is stored in the `ml` folder. It includes the heart disease dataset, the Jupyter notebook, saved model files, generated plots, and the FastAPI prediction service used by the HealthGuard backend.

1. Create and activate a Python virtual environment from the project root:

```powershell
python -m venv ml\.venv
ml\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
python3 -m venv ml/.venv
source ml/.venv/bin/activate
```

2. Install the ML requirements:

```powershell
pip install -r ml/requirements.txt
```

3. Run the Jupyter notebook:

```powershell
jupyter notebook ml/notebooks/healthguard_ml.ipynb
```

For a reproducible full notebook execution from the project root, run:

```powershell
jupyter nbconvert --to notebook --execute ml/notebooks/healthguard_ml.ipynb --inplace --ExecutePreprocessor.timeout=-1
```

The dataset used by the notebook is:

```text
ml/dataset/heart.csv
```

Generated ML outputs are saved in:

- `ml/models` for trained models, scalers, and column metadata
- `ml/results` for plots, CSV summaries, and the generated PDF report
- `ml/results/plots` for clustering plots such as the Elbow Method, Silhouette Score, and PCA cluster visualization
- `ml/model_comparison_results.json` for the platform-readable model summary

The notebook fixes the shared random seed at `42`, creates the output folders automatically, uses portable `Path`-based file locations, and exports the backend/admin JSON summary as part of the run.

To run the ML prediction API used by the backend:

```powershell
cd ml/api
uvicorn app:app --reload --port 8000
```

The backend reads the ML API base URL from `MlApi:BaseUrl` or `ML_API_BASE_URL`; by default it uses `http://localhost:8000`. When a user creates a prediction, the backend calls `POST /predict` on the Python API, stores the prediction result in SQL Server, refreshes Redis-backed prediction history caches, and sends notifications. If the Python API is not running, the backend falls back to its rule-based prediction service.

The admin model summary and reports pages read exported model metrics from:

```text
ml/model_comparison_results.json
```

## Authentication and Security

- Passwords are hashed with BCrypt.
- Access tokens use JWT bearer authentication.
- Refresh tokens are stored only as SHA-256 hashes in `RefreshTokens`.
- Role-based authorization remains available through `Admin` and `User` roles.
- CORS is restricted to configured frontend origins.
- Request DTOs use validation attributes and the API returns structured validation errors.

Auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `PUT /api/auth/change-password`

## SignalR Notifications

SignalR hub:

```text
/hubs/notifications
```

The frontend connects with the current JWT and receives `notificationReceived` events. Real-time notifications are sent when:

- A prediction is created
- Health data is updated
- A report is generated

## Reports and Data Transfer

The user reports page at `/reports` uses authenticated backend data only. Users see their own prediction history, risk distribution, health record summary counts, generated report count, and ML classification metrics.

Reports endpoints:

- `GET /api/reports/summary`
- `GET /api/reports/classification`
- `GET /api/reports/analysis`
- `GET /api/reports/history`
- `POST /api/reports/generate` with `from`, `to`, `reportType`, and `format`
- `GET /api/reports/export?format=json|csv|excel`
- `GET /api/reports/{id}/export?format=json|csv|excel`

Classification metrics and feature importance are read from `ml/model_comparison_results.json`, the same exported ML results file used by the admin model summary page. The reports UI is focused on classification, analysis, and prediction history because the current dataset and trained workflow are binary classification based.

Report generation stores metadata and result JSON in `GeneratedReports`, then sends a SignalR notification when the report is ready. Export supports JSON, CSV, and Excel-compatible `.xls`; PDF is not exposed unless a PDF renderer is added.

Health record export/import:

- `GET /api/data/health-records/export?format=json|csv|excel`
- `POST /api/data/health-records/import`

Excel export returns an Excel-compatible `.xls` table.

## Search, Filtering, and Sorting

Advanced query parameters were added to multiple lists without changing existing routes:

- Users
- Predictions
- Admin prediction records
- Health records
- Symptoms
- Notifications

Common parameters include `search`, `sortBy`, `sortDirection`, and resource-specific filters such as `riskLevel`, `severity`, `type`, `source`, and `isRead`.

## API Documentation

Swagger is enabled in development:

```text
/swagger
```

Use the Swagger bearer token field with:

```text
Bearer <access-token>
```

## Admin Model Summary

The admin model summary page at `/admin/model-summary` is powered by:

```text
GET /api/admin/model-summary
```

The endpoint is protected with admin authorization and reads the exported ML results from:

```text
ml/model_comparison_results.json
```

The JSON file is generated by `ml/notebooks/healthguard_ml.ipynb` and includes classification metrics, confusion matrices, hyperparameters, feature importance, clustering metrics, PCA metadata, and label-comparison metadata.

To refresh the file after rerunning ML training, execute the notebook from start to finish. The notebook writes `ml/model_comparison_results.json` automatically using the grouped shape:

```json
{
  "classification": [],
  "clustering": [],
  "featureImportance": []
}
```

The backend path can be overridden with:

```text
MlResults:ModelComparisonPath
```

## Admin Dataset Management

The admin datasets page at `/admin/datasets` is powered by admin-only dataset endpoints:

- `GET /api/admin/datasets`
- `GET /api/admin/datasets/{id}`
- `POST /api/admin/datasets/upload`
- `POST /api/admin/datasets/{id}/replace`
- `POST /api/admin/datasets/{id}/archive`

Dataset records are stored in `MlDatasets` and uploaded file metadata is linked through the existing `Files` table. The list endpoint supports `search`, `type`, `status`, `sortBy`, `sortDirection`, `page`, and `pageSize`.

The existing ML dataset at `ml/dataset/heart.csv` is automatically registered as `Heart Disease Dataset` with type `Classification`, source `Local ML Dataset`, and status `Active` when the datasets API is read. Uploaded and replacement files must be non-empty `.csv` files no larger than 10 MB and are stored under `ml/dataset/uploads`.

Upload creates a dataset record, counts CSV data rows, saves file metadata, and sets the chosen `Active` or `Processing` status. Replace updates the file, row count, upload date, and metadata. Archive changes the dataset status to `Archived`.
