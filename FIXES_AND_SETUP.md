# Updated Infosys Project – Fixes & Verification

This package contains the updated frontend and backend source.

## Fixed in this update

- Contract Details TypeScript `string | null | undefined` error fixed.
- ChangeDetectorRef added/retained for asynchronous UI updates in:
  - Contract & Compliance pages
  - Vendor Performance pages
  - Admin Analytics
  - Vendor Analytics
  - Notification Center
  - Reports & Export
- Vendor Performance dashboard uses backend performance summary and real purchase-order activity.
- Vendor Performance pages no longer use dummy performance records.
- Admin Analytics loads real vendor, procurement, delivery, contract, compliance, performance and notification counts.
- Vendor Analytics loads real dashboard, delivery, contract, communication, purchase-order and invoice data.
- Reports & Export uses backend report data rather than the previous hardcoded report datasets.
- Report filters are mapped to the correct backend parameters.
- PDF/Excel report endpoints now receive the applied filters.
- Notification Center now loads persisted user notifications from `/notifications/stored`.
- Mark-as-unread now persists through the backend.
- Contract Details handles optional contract descriptions safely.
- Procurement report department rows now contain real request/approval/order/spending aggregates.
- Vendor Performance report counts completed purchase orders correctly.

## Frontend setup

```bat
cd frontend
npm install
ng serve -o
```

If Angular reports a Node.js version requirement, update Node.js to the version required by the Angular CLI installed in `package.json`.

## Backend setup

Use the existing backend `.env.example` to configure the database/API environment. Do not commit secrets from `.env`.

```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Static verification performed

- Frontend TypeScript compilation with `tsc --noEmit`: passed.
- Backend Python `compileall`: passed.

The Angular CLI production build was not run in the build environment because its installed CLI requires a newer Node.js patch version than the environment provided.
