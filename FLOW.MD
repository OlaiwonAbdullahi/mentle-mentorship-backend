# Mentle Mentorship Enrollment Flow

This document details the enrollment and payment process for the Mentle Mentorship platform, distinguishing between African and European applicant flows.

## Core API Endpoints

- **Create Enrollment**: `POST /api/enrollments` (Multipart/form-data for receipts)
- **Initiate Payment**: `POST /api/payments/initiate` (For Africa/Paystack flow)
- **Verify Payment**: `POST /api/payments/verify` (For Africa/Paystack flow)

---

## 1. African Flow (Paystack Integration)

The African flow uses **Paystack** for automated payment processing.

### Step A: Submit Application

1. Frontend gathers user data from the enrollment form.
2. Frontend sends a `POST` request to `/api/enrollments` with `location: "Africa"` and `paymentMethod: "paystack"`.
3. Backend creates an enrollment record with status `pending`.

### Step B: Initiate Payment

1. Upon successful application submission, the frontend calls `POST /api/payments/initiate`.
   - **Payload**: `{ courseId, customerName, customerEmail, customerPhone }`
2. Backend returns an `authorizationUrl` and a `reference`.
3. Frontend redirects the user to the `authorizationUrl` (Paystack Checkout).

### Step C: Verification

1. Once payment is completed, Paystack redirects the user back to the platform.
2. Frontend extracts the `reference` from the URL and sends it to `POST /api/payments/verify`.
3. Backend verifies the transaction with Paystack and updates the enrollment status to `paid`.

---

## 2. European Flow (Manual Receipt)

The European flow requires a **Manual Payment** (Bank Transfer) and receipt upload.

### Step A: Submit Application & Receipt

1. User makes a manual bank transfer (details should be provided on the UI).
2. User fills out the enrollment form and uploads the payment receipt (Image/PDF).
3. Frontend sends a `POST` request to `/api/enrollments` as **Multipart/form-data**.
   - **Fields**: All standard enrollment fields.
   - **Extra**: `location: "Europe"`, `paymentMethod: "manual"`, `feeCommitment: true`.
   - **File**: `receipt` (the uploaded file).
4. Backend uploads the file to Cloudinary and creates an enrollment record with status `pending`.

### Step B: Admin Review

1. The enrollment stays `pending` until an administrator reviews the uploaded receipt.
2. Admin manually updates the enrollment to `paid` via the Admin Dashboard.

---

## Data Models Reference

### Enrollment Fields (`POST /api/enrollments`)

| Field                 | Type     | Description                                           |
| :-------------------- | :------- | :---------------------------------------------------- |
| `courseId`            | ObjectId | ID of the course/program                              |
| `fullName`            | String   | Full name of applicant                                |
| `email`               | String   | Valid email address                                   |
| `phone`               | String   | Phone number                                          |
| `location`            | Enum     | `"Africa"` or `"Europe"`                              |
| `educationLevel`      | Enum     | `"SSCE", "OND", "HND", "BSC", "MSc", "PhD", "Others"` |
| `linkedInProfile`     | String   | URL to LinkedIn profile                               |
| `serviceOffering`     | Enum     | Selected program type                                 |
| `motivation`          | String   | Why do they want to join?                             |
| `expectedOutcomes`    | String   | What do they hope to achieve?                         |
| `challenges`          | String   | Specific challenges/goals                             |
| `successMeasurement`  | String   | How will they measure success?                        |
| `furtherQuestions`    | String   | Optional questions                                    |
| `willingToAttendNext` | Boolean  | Willing to attend future cohorts                      |
| `paymentMethod`       | Enum     | `"paystack"` or `"manual"`                            |
| `feeCommitment`       | Boolean  | Required `true` for Europe                            |
| `receipt`             | File     | Required for `manual` payment method                  |

### Enrollment Statuses

- `pending`: Application submitted, payment not yet confirmed.
- `paid`: Payment verified (automatically for Paystack, manually for Europe).
- `failed`: Payment failed or application rejected.
