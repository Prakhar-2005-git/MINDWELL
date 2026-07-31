# MindWell

MindWell is a private daily-journaling and wellness application. It provides secure journal entries, mood and energy tracking, guided reflection prompts, and a calm breathing exercise.

## Security and privacy

Journal **content** is encrypted before it is written to MongoDB. The backend uses AES-256-GCM with:

- a unique cryptographically random 16-byte IV for every entry;
- an authentication tag to detect altered ciphertext; and
- an application secret supplied as `MASTER_KEY`, which must be at least 32 characters and is never committed to the repository.

MongoDB stores `encryptedContent`, `iv`, and `authTag`, rather than readable journal content. The server decrypts entries only after a valid JWT authenticates the owner. Mood, energy, prompt, and date remain plaintext so the dashboard can filter and chart them. This is application-level encryption at rest; it does not replace HTTPS, MongoDB encryption at rest, or secure secret management.

Never rotate `MASTER_KEY` without first migrating existing journal entries: entries encrypted with the old key cannot be decrypted with a new one.

## Run locally

Requirements: Node.js 20+ and a MongoDB Atlas database (or local MongoDB).

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
cd backend; npm ci; npm run dev
```

In another terminal:

```powershell
cd frontend; npm ci; npm start
```

Set `MONGO_URI`, `JWT_SECRET`, and `MASTER_KEY` in `backend/.env`. Set `REACT_APP_API_URL` in `frontend/.env` when the API is not running at `http://localhost:5000/api`.

## Privacy demo evidence

Use a throwaway test account and a distinctive test entry such as `PRIVATE-DEMO-ONLY: blue lantern`. Create the entry in the application, then open the `journals` collection in MongoDB Atlas and capture a screenshot that includes the document fields:

```text
encryptedContent: "<unreadable hexadecimal text>"
iv: "<hexadecimal text>"
authTag: "<hexadecimal text>"
```

The distinctive plaintext must not appear in the database screenshot. Add the image at `docs/privacy-demo/mongodb-encrypted-entry.png` before submitting. Do not include a screenshot containing real user entries or secrets.

## Deploy free on Vercel

The frontend and API deploy together from the repository root on Vercel's free Hobby plan. The API is a serverless function at `/api`, so no Render account or payment method is needed.

1. Create a free MongoDB Atlas M0 cluster and permit connections from Vercel. Copy its connection string into `MONGO_URI`.
2. In Vercel, import this GitHub repository. Leave **Root Directory** set to `./` (the repository root).
3. Add these environment variables for Production, Preview, and Development:

   ```text
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<random secret of at least 32 characters>
   MASTER_KEY=<separate random secret of at least 32 characters>
   CLIENT_ORIGIN=https://<your-vercel-project>.vercel.app
   ```

4. Deploy. Open `https://<your-vercel-project>.vercel.app/api/health`; it should return `{"status":"ok"}`.

The frontend automatically calls the same deployment at `/api`. Do not add these secrets to GitHub or create a `REACT_APP_API_URL` variable in Vercel.

See [DEPLOYMENT.md](DEPLOYMENT.md) for more detail.

## Validation

```powershell
cd backend; npm start
cd frontend; npm run build
```

The server intentionally refuses to start when `MONGO_URI`, `JWT_SECRET`, or a 32+-character `MASTER_KEY` is missing.
