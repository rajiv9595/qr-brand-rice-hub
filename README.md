# QR BRAND RICE HUB - Authentication & RBAC System

This is a production-ready Authentication and Role-Based Access Control (RBAC) system for the QR BRAND RICE HUB platform.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)
- **Security:** bcryptjs (password hashing), Joi (input validation)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the root directory (one has been provided) with the following:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr_brand_rice_hub
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "supplier"
  }
  ```
- **Roles available:** `admin`, `supplier`, `expert`, `customer` (default)

### 2. Supplier Profile
- **Endpoint:** `POST /api/supplier/profile` (Protected - Supplier)
- **Body:**
  ```json
  {
    "millName": "Green Valley Rice Mill",
    "gstNumber": "22AAAAA0000A1Z5",
    "address": "123 Mill Road, Industrial Area",
    "district": "Karnal",
    "state": "Haryana"
  }
  ```

### 3. Rice Listing
- **Endpoint:** `POST /api/rice` (Protected - Supplier)
- **Body (Multipart/Form-Data):**
  - `brandName`: "Diamond Basmati"
  - `riceVariety`: "1121 Sella"
  - `pricePerBag`: 4500
  - `stockAvailable`: 500
  - `bagWeightKg`: 25
  - `dispatchTimeline`: "2 Days"
  - `usageCategory`: "Guests/Special Meal Use"
  - `bagImage`: (File)
  - `grainImage`: (File)

### 4. Admin Management
- **GET** `/api/admin/pending-rice`: View all pending listings
- **PATCH** `/api/admin/rice/:id/approve`: Approve listing
- **PATCH** `/api/admin/rice/:id/reject`: Reject listing (body: `{"reason": "Incomplete data"}`)

### 5. Public Listings
- **GET** `/api/rice`: View only approved and active rice listings.

### 6. Search & Filter
- **Endpoint:** `GET /api/rice/search`
- **Query Parameters:**
  - `riceVariety`: Partial name search
  - `usageCategory`: Category filter
  - `minPrice` / `maxPrice`: Price range
  - `district` / `state`: Geographic filter
  - `sortBy`: `priceAsc`, `priceDesc`, `newest`
  - `page` / `limit`: Pagination
- **Example:** `/api/rice/search?riceVariety=Basmati&maxPrice=5000&sortBy=priceAsc`

### 7. Brand Comparison
- **Endpoint:** `POST /api/rice/compare`
- **Body:**
  ```json
  {
    "listingIds": ["60d...", "60e...", "60f..."]
  }
  ```
- **Rules:**
  - Minimum 2, maximum 4 listings.
  - Listings must be approved and active.
- **Response:**
  ```json
  {
    "success": true,
    "comparison": [
      {
        "id": "60d...",
        "brandName": "Premium Gold",
        "riceVariety": "Super Basmati",
        "pricePerBag": 4200,
        "bagWeightKg": 25,
        "usageCategory": "Guests/Special Meal Use",
        "supplier": {
          "millName": "Karnal Rice Mill",
          "district": "Karnal",
          "state": "Haryana"
        }
      }
    ]
  }
  ```

### 8. Reviews & Ratings
- **Submit Review**: `POST /api/reviews` (Protected)
  - Body: `{ riceListingId, grainQuality, cookingResult, taste, valueForMoney, comment }`
- **Update Review**: `PUT /api/reviews/:id` (Protected)
- **Delete Review**: `DELETE /api/reviews/:id` (Protected)
- **Get Ratings**: `GET /api/rice/:id/ratings` (Public)
  - Response shows overall average and category-wise breakdowns.

### 9. Expert Reviews
- **Submit Expert Review**: `POST /api/expert-review` (Protected - Expert/Admin)
  - Body: `{ riceListingId, suitabilityScore, grainQualityGrade, priceFairnessScore, recommendedUsage, finalRecommendation, expertNotes }`
- **Update Expert Review**: `PUT /api/expert-review/:id` (Protected - Expert/Admin)
- **Get Expert Review**: `GET /api/rice/:id/expert-review` (Public)
  - Detailed quality assessment from authorized professionals.

### 10. Cooking Tips & Preparation
- **Get Cooking Tips**: `GET /api/rice/:id/cooking-tips` (Public)
  - Specialized preparation guides for each rice brand.

### 11. Market Intelligence Feed
- **Create Update**: `POST /api/market-updates` (Protected - Admin/Expert)
  - Body: `{ title, description, category, district, state, priorityFlag }`
- **Get Feed**: `GET /api/market-updates` (Public)
  - Supports filtering by category and location. Priority updates appear first.

## Project Structure
```text
├── config/             # DB & Cloudinary connection
├── controllers/        # Auth, Supplier, Rice, Admin, Review, Expert Review, Cooking Tips, Market Update logic
├── middleware/         # Auth, RBAC & Error middleware
├── models/             # User, SupplierProfile, RiceListing, Review, ExpertReview, CookingTips, MarketUpdate schemas
├── routes/             # API routes
├── utils/              # Helper functions (JWT generation)
└── server.js           # App entry point
```
