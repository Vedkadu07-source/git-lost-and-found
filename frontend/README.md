# 🔍 GIT Lost & Found

A secure, full-stack campus network application designed exclusively for the **Gharda Institute of Technology (GIT)** community. This platform allows students and staff to securely report, locate, and return lost items using high-resolution satellite mapping and automated email matching.

## 🚀 Features

### Public Features
*   **Domain-Restricted Authentication:** Secure Google OAuth login strictly locked to `@git-india.edu.in` email addresses.
*   **Automated Match Alerts:** Background cron-style jobs automatically scan new "Found" reports and email users with matching "Lost" items in the same category.
*   **Satellite Campus Mapping:** High-resolution Esri satellite map integration allows users to drop precise coordinate pins for found items.
*   **Live Search & Filtering:** Real-time, case-insensitive keyword search and category filtering with debounced API calls.
*   **Optimized Feed:** Paginated infinite-scroll architecture to handle thousands of items smoothly.
*   **Modern UI/UX:** Sleek, responsive design built with Tailwind CSS and `react-hot-toast` non-blocking notifications.

### Security & Admin Features
*   **Admin Command Center:** Role-Based Access Control (RBAC) dashboard for campus staff to moderate items and view reporter contact info.
*   **Fortified Backend:** Protected by `helmet` headers, strict `cors` origins, and `express-rate-limit` DDoS protection.
*   **Safe Uploads:** Memory-buffered Cloudinary integration with strict 5MB file size and format validation via `multer`.

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Lucide React, Leaflet/Esri |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Storage** | Cloudinary (Images) |
| **External APIs**| Nodemailer (Gmail App Passwords), Google OAuth |

## 📐 Project Architecture

```mermaid
flowchart TD
    A[GIT Student] -->|HTTPS| B(React Frontend)
    B -->|REST API / JWT| C{Express Backend}
    
    C -->|Prisma ORM| D[(PostgreSQL / Neon DB)]
    C -->|Buffer Stream| E[Cloudinary Image Cloud]
    C -->|SMTP| F[Nodemailer]
    
    F -->|Match Alert| G[Original Owner Email]