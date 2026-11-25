# LEC

Aplicação Angular + Spring Boot com PostgreSQL. O catálogo de perguntas e os grupos de classificação são carregados da API; os rascunhos, respostas, comentários e decisões de revisão são persistidos no banco.

## Executar com Docker Compose

No PowerShell:

```powershell
Set-Location C:\Users\Matheus\LEC\lec
Copy-Item .env.example .env
docker compose up --build
```

Endereços locais:

| Serviço | URL/porta |
|---|---|
| Frontend | http://localhost:4201 |
| API | http://localhost:8081 |
| PostgreSQL (acesso local) | localhost:55433 |

O Compose aguarda o healthcheck do PostgreSQL antes de iniciar a API e o healthcheck da API antes do frontend. O volume `lec_postgres_data` mantém os dados entre reinicializações. Para parar sem apagar dados, use `docker compose down`. O `.env.example` contém valores apenas para desenvolvimento local; use credenciais próprias em ambientes compartilhados.

As migrations Flyway criam o esquema e inserem somente o catálogo inicial. A aplicação não importa o antigo `backup_lec.sql` nem cria LECs de demonstração.

## Executar sem containerizar frontend/API

Suba um PostgreSQL compatível e defina as variáveis no terminal do backend:

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:55433/lec_db"
$env:SPRING_DATASOURCE_USERNAME = "lec_user"
$env:SPRING_DATASOURCE_PASSWORD = "dev-password-change-me"
$env:FRONTEND_ORIGIN = "http://localhost:4200"
mvn spring-boot:run
```

Em outro terminal:

```powershell
Set-Location C:\Users\Matheus\LEC\lec-frontend
npm ci
npm start
```

O servidor Angular encaminha `/api` para `localhost:8080`. `npm run build` gera a versão de produção.

## Testes

Com os serviços iniciados pelo Compose:

```powershell
Set-Location C:\Users\Matheus\LEC\lec
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:55433/lec_db"
$env:SPRING_DATASOURCE_USERNAME = "lec_user"
$env:SPRING_DATASOURCE_PASSWORD = "dev-password-change-me"
mvn test
Set-Location ..\lec-frontend
npm test
```

Os testes do frontend usam Playwright e exercitam criação/edição/exclusão, validação e o fluxo de revisão. O primeiro uso de Playwright requer `npx playwright install chromium`.

## Autenticação e assistente de IA

Por decisão do usuário, esta aplicação não autentica usuários nem separa operações por perfil. Qualquer pessoa com acesso à rede da aplicação pode executar as operações expostas pela API; não publique o serviço sem adicionar um provedor de autenticação e autorização.

O assistente de sugestões permanece desativado: o projeto não contém provedor/modelo de IA ou credenciais para realizar essa chamada. O formulário explica a pendência e não envia dados a um serviço inexistente.
