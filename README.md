# Backend Setup

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

## MongoDB note

The sale creation service uses a MongoDB transaction to make stock reduction and sale creation safe. Use MongoDB Atlas or a local replica set for full transaction support.

## Default credentials

- Admin: `admin@erp.com` / `Admin@12345`
- Manager: `manager@erp.com` / `Manager@12345`
- Employee: `employee@erp.com` / `Employee@12345`
