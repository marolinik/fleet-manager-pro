# Setup Servisa - Detaljan Vodič

## Backend .env fajl
Kreirajte `backend/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/fleet_manager"
PORT=3001
NODE_ENV=development

# Auth0
AUTH0_DOMAIN=your-tenant.eu.auth0.com
AUTH0_AUDIENCE=https://api.fleet-manager.com
AUTH0_CLIENT_ID=xxxxxxxxxxxx
AUTH0_CLIENT_SECRET=xxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Notification settings
NOTIFICATION_DAYS_BEFORE_EXPIRY=30
```

## Frontend .env fajl
Kreirajte `frontend/.env`:
```
VITE_AUTH0_DOMAIN=your-tenant.eu.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxxxxxxxxx
VITE_AUTH0_AUDIENCE=https://api.fleet-manager.com
VITE_API_URL=http://localhost:3001
```

## Testiranje lokalno

1. Instalirajte dependencies:
```bash
cd fleet-manager-pro
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Pokrenite PostgreSQL lokalno ili koristite Docker:
```bash
docker run -d \
  --name fleet-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fleet_manager \
  -p 5432:5432 \
  postgres:15
```

3. Kreirajte bazu podataka:
```bash
cd backend
npx prisma migrate dev --name init
```

4. Pokrenite aplikaciju:
```bash
# U root folderu
npm run dev
```

## Troubleshooting

### Auth0 problemi:
- Proverite da li su Callback URLs tačni
- Proverite da li je API Audience isti u backend i frontend

### SendGrid problemi:
- Verifikujte sender email
- Za Gmail, možda treba da omogućite "Less secure apps"

### Cloudinary problemi:
- Proverite da li su svi kredencijali tačni
- Testirajte upload sa malim fajlom prvo

## Besplatni limiti:
- **Auth0**: 7,000 aktivnih korisnika mesečno
- **Cloudinary**: 25GB storage, 25GB bandwidth mesečno
- **SendGrid**: 100 emails dnevno

Ovi limiti su više nego dovoljni za početak!