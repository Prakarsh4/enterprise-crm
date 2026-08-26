# Enterprise CRM System — Phase 1: Foundation, Authentication & CRM Core

Production-grade, extensible Enterprise CRM built with Node.js, Express, MongoDB (Mongoose ODM), React 18, Vite, and Tailwind CSS. Designed specifically to support incremental extensions in Phase 2 (Kanban & Advanced Sales Analytics) and Phase 3 (Automations, Audit Logs & Enterprise Integrations).

---

## 1. Tech Stack

- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Database:** MongoDB, Mongoose ODM
- **Frontend:** React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide React
- **Architecture:** Controller-Service-Model architecture with centralized error handling and JWT-based Role Access Control (RBAC).

---

## 2. Default Demo Credentials

Pre-configured in the database seed script:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.enterprise` | `Password123!` | Complete unrestricted access across all CRM records and management operations. |
| **Manager** | `manager@crm.enterprise` | `Password123!` | Manage and view team CRM records, deals, and reports. |
| **Sales Rep** | `sales@crm.enterprise` | `Password123!` | Manage and view assigned leads, customers, deals, and tasks. |

---

## 3. Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

---

## 4. Quick Start & Installation

### Step 1: Clone and Configure Environment

```bash
# Clone the repository
git clone <repo-url> enterprise-crm
cd enterprise-crm

# Set up server environment
cp .env.example server/.env