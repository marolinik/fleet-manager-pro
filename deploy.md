# Deployment Instrukcije za Fleet Manager Pro

## 🚀 Priprema za deployment

### 1. Auth0 Setup

1. Kreirajte Auth0 nalog na https://auth0.com
2. Kreirajte novu aplikaciju (Single Page Application)
3. Dodajte Allowed Callback URLs:
   - `http://localhost:5173` (development)
   - `https://fleet-manager-app.onrender.com` (production)
4. Dodajte Allowed Logout URLs:
   - `http://localhost:5173`
   - `https://fleet-manager-app.onrender.com`
5. Sačuvajte Domain, Client ID i Client Secret

### 2. Cloudinary Setup

1. Kreirajte nalog na https://cloudinary.com
2. Iz Dashboard-a kopirajte:
   - Cloud Name
   - API Key
   - API Secret

### 3. SendGrid Setup

1. Kreirajte nalog na https://sendgrid.com
2. Kreirajte API Key sa Full Access
3. Verifikujte sender email adresu

## 📦 GitHub Repository

```bash
# Inicijalizujte git u projektu
cd fleet-manager-pro
git init
git add .
git commit -m "Initial commit"

# Kreirajte novi repository na GitHub-u
# Zatim dodajte remote i push-ujte kod
git remote add origin https://github.com/YOUR_USERNAME/fleet-manager-pro.git
git branch -M main
git push -u origin main
```

## 🌐 Render.com Deployment

### 1. Kreirajte Render nalog

Idite na https://render.com i registrujte se (može sa GitHub nalogom)

### 2. Deploy sa Blueprint

1. U Render dashboard-u kliknite "New +"
2. Izaberite "Blueprint"
3. Povezite GitHub repository
4. Render će automatski detektovati `render.yaml` fajl

### 3. Podesite Environment Variables

Za **fleet-manager-api** servis dodajte:
- `AUTH0_DOMAIN`: vaš Auth0 domain
- `AUTH0_AUDIENCE`: https://api.fleet-manager.com
- `AUTH0_CLIENT_ID`: vaš Auth0 client ID
- `AUTH0_CLIENT_SECRET`: vaš Auth0 client secret
- `CLOUDINARY_CLOUD_NAME`: vaš Cloudinary cloud name
- `CLOUDINARY_API_KEY`: vaš Cloudinary API key
- `CLOUDINARY_API_SECRET`: vaš Cloudinary API secret
- `SENDGRID_API_KEY`: vaš SendGrid API key

Za **fleet-manager-app** servis dodajte:
- `VITE_AUTH0_DOMAIN`: vaš Auth0 domain
- `VITE_AUTH0_CLIENT_ID`: vaš Auth0 client ID
- `VITE_AUTH0_AUDIENCE`: https://api.fleet-manager.com

### 4. Pokrenite deployment

Kliknite "Apply" i Render će automatski:
1. Kreirati PostgreSQL bazu
2. Build-ovati i deploy-ovati backend
3. Build-ovati i deploy-ovati frontend
4. Povezati sve servise

## 🔄 Continuous Deployment

### GitHub Actions

1. U GitHub repository settings dodajte secret:
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: kopirajte iz Render dashboard-a (Settings > Deploy Hook)

2. Svaki push na `main` branch će automatski triggerovati deployment

## 🧪 Post-Deployment

### 1. Inicijalizujte bazu podataka

```bash
# SSH u backend servis preko Render Shell
cd backend
npm run prisma:migrate deploy
npm run seed  # Ako imate seed skriptu
```

### 2. Testirajte aplikaciju

1. Otvorite frontend URL (npr. https://fleet-manager-app.onrender.com)
2. Prijavite se sa Auth0
3. Proverite da li sve funkcionalnosti rade

### 3. Monitoring

- Koristite Render dashboard za logs
- Postavite alerts za downtime
- Pratite performance metrics

## 🛡️ Sigurnost

1. **HTTPS**: Render automatski obezbjeđuje SSL sertifikate
2. **Environment Variables**: Nikad ne commit-ujte .env fajlove
3. **Database**: Koristite IP allowlist za produkciju
4. **CORS**: Proverite da su samo dozvoljeni domeni u CORS policy

## 📱 PWA Setup

Aplikacija je konfigurisana kao PWA i može se instalirati na:
- Android: Chrome > Menu > "Add to Home screen"
- iOS: Safari > Share > "Add to Home Screen"
- Desktop: Chrome > Menu > "Install Fleet Manager Pro"

## 🔧 Troubleshooting

### Problem: Build fail
- Proverite logs u Render dashboard
- Proverite da li su sve dependencies instalirane

### Problem: Database connection
- Proverite DATABASE_URL environment variable
- Restartujte backend servis

### Problem: Auth0 ne radi
- Proverite callback URLs u Auth0 dashboard
- Proverite environment variables

## 📈 Skaliranje

Kada aplikacija poraste:
1. Upgrade na veći Render plan
2. Dodajte Redis za caching
3. Razmislite o CDN za static assets
4. Implementirajte horizontal scaling