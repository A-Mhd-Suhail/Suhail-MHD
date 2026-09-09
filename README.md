# MHD Hospital — My Health Defense Hospital 24×7

Hospital management portal (Patient / Doctor / Hospital Admin) built with
Firebase Auth + Firestore. One Patient. One Medical Journey.

## Project structure

```
MHD-Hospital/
├── public/
│   ├── index.html              # Single-page app shell (all screens)
│   ├── css/
│   │   └── style.css           # Theme system (light/dark/pink), components
│   └── js/
│       ├── i18n.js             # 10-language translations + language engine
│       ├── patient.js          # Patient portal (dashboard, cases, meds, results, booking)
│       ├── app.js              # Core: auth, routing, doctor & hospital portals
│       └── firebase-config.js  # Firebase project credentials
├── firestore.rules             # Firestore security rules
├── server.js                   # Tiny static dev server
├── package.json                # npm start
└── .gitignore
```

## Setup

1. Create a Firebase project (Auth: Email/Password enabled, Firestore created).
2. Put your credentials in `public/js/firebase-config.js`.
3. Publish `firestore.rules` to Firestore.
4. Run `npm start` → http://localhost:3000 (or deploy the `public/` folder to any static host, e.g. GitHub Pages).

## Demo accounts

Quick demo buttons on the login screen create accounts automatically (password: `demo123`).
