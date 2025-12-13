# Digital Wallet Service API 💳

## Overview
This project is a robust and scalable backend service designed to manage user authentication, API key generation, and digital wallet transactions. Built with TypeScript, Node.js, and the NestJS framework, it integrates with Prisma ORM for seamless PostgreSQL database interaction and leverages Paystack for payment processing and Google OAuth for streamlined user authentication.

## Features
*   **User Authentication**: Secure user registration and login via Google OAuth.
*   **API Key Management**: Generate, manage, and revoke API keys with fine-grained permissions and configurable expiry.
*   **Digital Wallet**: Users get a personal digital wallet for managing funds.
*   **Funds Deposit**: Integrate with Paystack to allow users to deposit funds into their wallets.
*   **Fund Transfers**: Securely transfer funds between user wallets within the system.
*   **Transaction History**: View a detailed history of all wallet transactions (deposits and transfers).
*   **Webhook Handling**: Process Paystack webhooks for real-time payment status updates.
*   **Containerization**: Docker Compose setup for easy local development and deployment of the application and its PostgreSQL database.
*   **Structured Logging**: Utilizes Winston for comprehensive and configurable logging.
*   **API Documentation**: Auto-generated Swagger documentation for all endpoints.

## Getting Started
To get this Digital Wallet Service running locally, follow these steps.

### Installation
Begin by cloning the repository and installing its dependencies:

```bash
git clone https://github.com/iamArvy/wallet-service.git
cd wallet-service
npm install
```

Set up your local PostgreSQL database using Docker Compose:

```bash
docker-compose up -d db
```

Once the database container is healthy, apply the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

Start the application in development mode:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

### Environment Variables
Configure your environment by creating a `.env` file in the project root with the following variables. Examples are provided for typical development settings.

```ini
# Application Configuration
NODE_ENV=development
PORT=3000
APP_NAME="Digital Wallet Service API"
APP_SLUG="digital-wallet-service"
APP_HOST="localhost"
APP_URL="http://localhost:3000"
APP_PREFIX="api"
APP_VERSION="v1"
APP_DESCRIPTION="A backend service for digital wallet management"

# Database Configuration (for Docker Compose setup)
DATABASE_URL="postgresql://app-db-user:app-db-password@localhost:5432/app-db?schema=public"
DB_HOST="localhost"
DB_PORT=5432
DB_USER="app-db-user"
DB_PASSWORD="app-db-password"
DB_NAME="app-db"

# Logging Configuration
LOG_LEVEL=info

# JWT Configuration
JWT_SECRET="supersecretjwtkeythatshouldbeverylongandrandominproduction"

# Paystack Configuration
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/auth/google/callback"
```

## API Documentation
The API documentation is available via Swagger UI.

### Base URL
`http://localhost:3000/api/v1`

### Endpoints

#### GET /auth/google
Redirects the user to the Google OAuth consent screen to initiate the authentication process.

**Request**:
No payload required.
**Response**:
```json
{
  "google_auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=your-google-client-id.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent"
}
```
**Errors**:
- `400 Bad Request`: Google authentication failed or invalid token.

#### GET /auth/google/callback
Handles the callback from Google after successful authentication, creates/updates the user, and issues JWT tokens.

**Request**:
Handled automatically by Google OAuth flow (query parameters).
**Response**:
```json
{
  "user": {
    "id": "clx41t2190000y8109yv3x96u",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "https://lh3.googleusercontent.com/a/ALm5xxxxxxxx",
    "created_at": "2024-07-25T10:00:00.000Z",
    "updated_at": "2024-07-25T10:00:00.000Z"
  },
  "access": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 7200
  }
}
```
**Errors**:
- `400 Bad Request`: Google authentication failed (e.g., no user found).

#### GET /auth/me
Retrieves the authenticated user's profile and wallet information. Requires JWT authentication.

**Request**:
No payload. Requires `Authorization: Bearer <JWT_TOKEN>` header.
**Response**:
```json
{
  "id": "clx41t2190000y8109yv3x96u",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "profile_picture": "https://example.com/avatar.png",
  "wallet": {
    "wallet_number": "12345678901234",
    "balance": "5000000000"
  }
}
```
**Errors**:
- `401 Unauthorized`: No authentication provided or invalid JWT token.
- `404 Not Found`: User not found.

#### POST /keys
Creates a new API key for the authenticated user with specified permissions and expiry. Requires JWT authentication.

**Request**:
```json
{
  "name": "my-payment-integration",
  "permissions": ["deposit", "read"],
  "expiry": "1M"
}
```
**Response**:
```json
{
  "id": "clx45e99l0000k010x82r0f6u",
  "name": "my-payment-integration",
  "api_key": "sk_live_2e7b5f9a0c8d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
  "permissions": ["deposit", "read"],
  "expires_at": "2024-08-25T10:00:00.000Z",
  "revoked": false,
  "created_at": "2024-07-25T10:00:00.000Z",
  "updated_at": "2024-07-25T10:00:00.000Z"
}
```
**Errors**:
- `400 Bad Request`: Key limit reached, or invalid expiry value (must be 1H, 1D, 1M, 1Y).
- `401 Unauthorized`: No authentication provided or invalid JWT token.
- `409 Conflict`: Key with the provided name already exists.

#### GET /keys
Retrieves all API keys belonging to the authenticated user. Requires JWT authentication.

**Request**:
No payload. Requires `Authorization: Bearer <JWT_TOKEN>` header.
**Response**:
```json
[
  {
    "id": "clx45e99l0000k010x82r0f6u",
    "name": "my-payment-integration",
    "api_key": "sk_live_2e7b5f9a0c8d1e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    "permissions": ["deposit", "read"],
    "expires_at": "2024-08-25T10:00:00.000Z",
    "revoked": false,
    "created_at": "2024-07-25T10:00:00.000Z",
    "updated_at": "2024-07-25T10:00:00.000Z"
  },
  {
    "id": "clx45z99p0001k010x82r0f7a",
    "name": "reporting-key",
    "api_key": "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "permissions": ["read"],
    "expires_at": "2024-07-20T10:00:00.000Z",
    "revoked": true,
    "created_at": "2024-06-25T10:00:00.000Z",
    "updated_at": "2024-07-25T10:00:00.000Z"
  }
]
```
**Errors**:
- `401 Unauthorized`: No authentication provided or invalid JWT token.

#### POST /keys/rollover
Rolls over an expired API key, revoking the old one and issuing a new one with the same name and permissions but an updated expiry and version. Requires JWT authentication.

**Request**:
```json
{
  "expired_key_id": "clx45z99p0001k010x82r0f7a",
  "expiry": "1Y"
}
```
**Response**:
```json
{
  "id": "clx45z99p0001k010x82r0f7b",
  "name": "reporting-key",
  "api_key": "sk_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
  "permissions": ["read"],
  "expires_at": "2025-07-25T10:00:00.000Z",
  "revoked": false,
  "created_at": "2024-07-25T10:00:00.000Z",
  "updated_at": "2024-07-25T10:00:00.000Z"
}
```
**Errors**:
- `400 Bad Request`: Only expired keys can be rolled over, or invalid expiry value.
- `401 Unauthorized`: No authentication provided or invalid JWT token.
- `404 Not Found`: Key not found.

#### DELETE /keys/:id
Revokes an active API key, making it unusable. Requires JWT authentication.

**Request**:
No payload. `id` is a UUID in the path. Requires `Authorization: Bearer <JWT_TOKEN>` header.
**Response**:
```json
"key revoked successfully"
```
**Errors**:
- `400 Bad Request`: Key already revoked.
- `401 Unauthorized`: No authentication provided or invalid JWT token.
- `404 Not Found`: Key not found.

#### POST /wallet/deposit
Initiates a payment for depositing funds into the authenticated user's wallet via Paystack. Requires JWT or API Key authentication with `deposit` permission. An `Idempotency-Key` header is required to prevent duplicate transactions.

**Request**:
**Headers**:
- `Authorization: Bearer <JWT_TOKEN>` OR `x-api-key: <API_KEY>`
- `Idempotency-Key: <UNIQUE_STRING>` (e.g., a UUID or client-generated unique ID for this request)
**Payload**:
```json
{
  "amount": 500000
}
```
**Response**:
```json
{
  "reference": "T1234567890",
  "authorization_url": "https://checkout.paystack.com/abcdef12345"
}
```
**Errors**:
- `400 Bad Request`: Invalid amount or idempotency key missing.
- `401 Unauthorized`: No authentication provided, invalid JWT/API key, or missing `deposit` permission.
- `404 Not Found`: Wallet not found for the user.
- `503 Service Unavailable`: Paystack not configured or unreachable.

#### GET /wallet/transactions
Retrieves a list of all transactions for the authenticated user's wallet. Requires JWT or API Key authentication with `read` permission.

**Request**:
No payload.
**Headers**:
- `Authorization: Bearer <JWT_TOKEN>` OR `x-api-key: <API_KEY>`
**Response**:
```json
{
  "items": [
    {
      "id": "clx45e99l0000k010x82r0f6u",
      "amount": "500000",
      "status": "success",
      "type": "deposit",
      "wallet_id": "clx41t2190000y8109yv3x96u",
      "receiver_wallet_id": null,
      "reference": "T1234567890",
      "paid_at": "2024-07-25T10:15:00.000Z",
      "created_at": "2024-07-25T10:00:00.000Z",
      "updated_at": "2024-07-25T10:15:00.000Z"
    },
    {
      "id": "clx47a99p0001k010x82r0f7a",
      "amount": "100000",
      "status": "success",
      "type": "transfer",
      "wallet_id": "clx41t2190000y8109yv3x96u",
      "receiver_wallet_id": "clx48c99q0002k010x82r0f7b",
      "reference": null,
      "paid_at": null,
      "created_at": "2024-07-25T10:30:00.000Z",
      "updated_at": "2024-07-25T10:30:00.000Z"
    }
  ]
}
```
**Errors**:
- `401 Unauthorized`: No authentication provided, invalid JWT/API key, or missing `read` permission.

#### POST /wallet/paystack/webhook
Endpoint for Paystack to send webhook events. This processes payment success and other events.

**Request**:
**Headers**:
- `x-paystack-signature: <PAYSTACK_WEBHOOK_SIGNATURE>`
**Payload**:
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "T1234567890",
    "amount": 500000,
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2024-07-25T10:15:00.000Z",
    "created_at": "2024-07-25T10:15:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "192.168.1.1",
    "metadata": {},
    "fees_breakdown": null,
    "log": null,
    "fees": 2500,
    "authorization": {
      "authorization_code": "AUTH_xxxx",
      "bin": "408408",
      "last4": "4081",
      "exp_month": "09",
      "exp_year": "2025",
      "channel": "card",
      "card_type": "visa ",
      "bank": "Zenith Bank",
      "country_code": "NG",
      "brand": "visa",
      "reusable": true,
      "signature": "SIG_xxxx",
      "account_name": null
    },
    "customer": {
      "id": 12345,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "customer_code": "CUS_xxxx",
      "phone": null,
      "metadata": null,
      "risk_action": "default",
      "international_format_phone": null
    },
    "plan": null,
    "subaccount": null,
    "split": {},
    "order_id": null,
    "paidAt": "2024-07-25T10:15:00.000Z",
    "requested_amount": 500000,
    "pos_transaction_data": null,
    "source": {
      "type": "api",
      "source": "webhook",
      "entry_point": "callback",
      "identifier": null
    }
  }
}
```
**Response**:
`200 OK` on successful processing. No specific JSON payload returned as response is mainly for webhook acknowledgment.
**Errors**:
- `401 Unauthorized`: Invalid Paystack webhook signature.
- `404 Not Found`: Transaction not found for the given reference.
- `500 Internal Server Error`: Unhandled webhook event or other processing error.

#### GET /wallet/deposit/:reference/status
Checks the status of a specific deposit transaction using its reference.

**Request**:
No payload. `reference` is a string in the path.
**Response**:
```json
{
  "status": "success"
}
```
**Errors**:
- `404 Not Found`: Transaction not found.

#### GET /wallet/balance
Retrieves the current balance of the authenticated user's wallet. Requires JWT or API Key authentication with `read` permission.

**Request**:
No payload.
**Headers**:
- `Authorization: Bearer <JWT_TOKEN>` OR `x-api-key: <API_KEY>`
**Response**:
```json
{
  "balance": "5000000000"
}
```
**Errors**:
- `401 Unauthorized`: No authentication provided, invalid JWT/API key, or missing `read` permission.
- `404 Not Found`: Wallet not found for the user.

#### POST /wallet/transfer
Transfers funds from the authenticated user's wallet to another user's wallet. Requires JWT or API Key authentication with `transfer` permission.

**Request**:
**Headers**:
- `Authorization: Bearer <JWT_TOKEN>` OR `x-api-key: <API_KEY>`
**Payload**:
```json
{
  "wallet_number": "98765432109876",
  "amount": 100000
}
```
**Response**:
```json
{
  "status": "success",
  "message": "transfer completed"
}
```
**Errors**:
- `400 Bad Request`: Invalid wallet number, amount, recipient wallet not found, or insufficient balance.
- `401 Unauthorized`: No authentication provided, invalid JWT/API key, or missing `transfer` permission.
- `404 Not Found`: Sender's wallet not found.

## Usage
### Run with Docker Compose
For a full local environment including the application and database:

1.  **Build and Run**:
    ```bash
    docker-compose build
    docker-compose up
    ```
2.  **Access the API**: The application will be available at `http://localhost:3000/api/v1`.
3.  **Access Swagger Docs**: Navigate to `http://localhost:3000/docs` in your browser for interactive API documentation.

### Run Locally (without Docker for application)
If you prefer to run the NestJS application directly:

1.  **Ensure Docker DB is running**:
    ```bash
    docker-compose up -d db
    ```
2.  **Start Development Server**:
    ```bash
    npm run start:dev
    ```
3.  **Access the API**: The application will be available at `http://localhost:3000/api/v1`.
4.  **Access Swagger Docs**: Navigate to `http://localhost:3000/docs` in your browser.

## Technologies Used
| Technology         | Description                                     | Link                                                            |
| :----------------- | :---------------------------------------------- | :-------------------------------------------------------------- |
| **TypeScript**     | Strongly typed superset of JavaScript           | [TypeScript](https://www.typescriptlang.org/)                   |
| **Node.js**        | JavaScript runtime built on Chrome's V8 engine  | [Node.js](https://nodejs.org/en/)                               |
| **NestJS**         | Progressive Node.js framework for scalable apps | [NestJS](https://nestjs.com/)                                   |
| **Prisma ORM**     | Next-generation ORM for Node.js and TypeScript  | [Prisma](https://www.prisma.io/)                                |
| **PostgreSQL**     | Powerful, open-source object-relational database | [PostgreSQL](https://www.postgresql.org/)                       |
| **Docker**         | Containerization platform                       | [Docker](https://www.docker.com/)                               |
| **Passport.js**    | Authentication middleware for Node.js           | [Passport.js](http://www.passportjs.org/)                       |
| **JWT**            | JSON Web Tokens for secure API authentication   | [JWT.io](https://jwt.io/)                                       |
| **Winston**        | Versatile logging library                       | [Winston](https://github.com/winstonjs/winston)                 |
| **Swagger/OpenAPI**| API documentation and testing UI                | [Swagger](https://swagger.io/docs/specification/about-api-description/) |
| **Paystack**       | Payment gateway integration for deposits        | [Paystack](https://paystack.com/)                               |
| **Google OAuth2**  | Authentication via Google accounts              | [Google OAuth2](https://developers.google.com/identity/protocols/oauth2) |

## License
This project is currently UNLICENSED.

## Author Info
**[Your Name]**
*   LinkedIn: [Your LinkedIn Profile]
*   Twitter: [@YourTwitterHandle]

## Badges
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-red.svg)](https://opensource.org/licenses/unlicense)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)