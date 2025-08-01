# Fleet Manager Pro 🚗

Moderna aplikacija za upravljanje voznim parkom sa naprednim funkcionalnostima praćenja troškova, održavanja i dokumentacije.

## 🚀 Funkcionalnosti

- **Upravljanje vozilima** - Kompletna evidencija voznog parka
- **Praćenje troškova** - Detaljni pregled svih troškova po vozilu
- **Dokumentacija** - Digitalizacija svih dokumenata sa automatskim podsetnicima
- **Multi-role sistem** - Admin, Fleet Manager, Knjigovodja, Vozač, Vlasnik
- **Notifikacije** - Automatski podsjetnici za registraciju, servis, osiguranje
- **PWA podrška** - Radi offline, instalira se na telefon
- **Izvještaji** - Detaljni izvještaji sa grafovima

## 📋 Role i dozvole

### Administrator
- Potpuna kontrola sistema
- Upravljanje korisnicima i rolama
- Pristup svim podacima

### Fleet Manager
- Pregled svih vozila i vozača
- Upravljanje dodjelama vozila
- Praćenje održavanja

### Knjigovodja
- Unos i pregled troškova
- Finansijski izvještaji
- Upravljanje računima

### Vozač
- Pregled svog vozila
- Unos troškova goriva
- Prijavljivanje kvarova

### Vlasnik vozila
- Potpun pristup svom vozilu
- Pregled troškova i dokumenata
- Izvještaji za svoje vozilo

## 🛠️ Tehnički stek

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Baza**: PostgreSQL (Prisma ORM)
- **Autentifikacija**: Auth0
- **File Storage**: Cloudinary
- **Deployment**: Render.com

## 🚀 Pokretanje

```bash
# Instalacija
npm install

# Development
npm run dev

# Build
npm run build

# Deployment
npm run deploy
```

## 📝 Environment varijable

Kopirajte `.env.example` u `.env` i popunite vrijednosti:

```bash
# Backend
DATABASE_URL=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
CLOUDINARY_URL=

# Frontend
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_API_URL=
```

## 📱 PWA Podrška

Aplikacija se može instalirati kao PWA na mobilnim uređajima i desktopu za offline pristup.

## 🔐 Sigurnost

- Auth0 autentifikacija sa MFA
- Role-based access control
- Enkripcija osjetljivih podataka
- GDPR compliance