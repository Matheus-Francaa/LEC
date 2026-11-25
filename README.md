# LEC

Aplicação composta por:

- `lec/`: backend Spring Boot (Java 21), API e migrations do PostgreSQL.
- `lec-frontend/`: interface Angular.

## Executar o projeto completo com Docker

Requer Docker Desktop com Docker Compose. No PowerShell:

```powershell
Set-Location C:\Users\Matheus\LEC\lec
Copy-Item .env.example .env
docker compose up --build
```

Quando os serviços estiverem prontos:

- Frontend: http://localhost:4201
- API: http://localhost:8081
- PostgreSQL: `localhost:55433`

Os valores de `.env.example` são para desenvolvimento local. Para parar, use `Ctrl+C` e depois `docker compose down`. Os dados do banco permanecem no volume do Docker.

## Executar frontend e backend localmente

Com Docker, inicie somente o banco:

```powershell
Set-Location C:\Users\Matheus\LEC\lec
Copy-Item .env.example .env
docker compose up -d postgres
```

Em outro terminal, inicie a API:

```powershell
Set-Location C:\Users\Matheus\LEC\lec
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:55433/lec_db"
$env:SPRING_DATASOURCE_USERNAME = "lec_user"
$env:SPRING_DATASOURCE_PASSWORD = "dev-password-change-me"
$env:FRONTEND_ORIGIN = "http://localhost:4200"
.\mvnw.cmd spring-boot:run
```

Em outro terminal, instale as dependências e inicie o frontend:

```powershell
Set-Location C:\Users\Matheus\LEC\lec-frontend
npm ci
npm start
```

O frontend local fica em http://localhost:4200 e a API em http://localhost:8080.
