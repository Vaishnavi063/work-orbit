# 💰 WorkOrbit Wallet & Revenue System

## 📋 Overview

A secure wallet and revenue tracking system for the WorkOrbit freelancing platform. Handles payment processing, fund management, and earnings analytics for clients and freelancers.

### ✨ Key Features
- **💳 Wallet Management** - Add money, check balances, withdraw funds
- **🔒 Secure Payments** - Auto-freeze funds during projects
- **💸 Auto Release** - Payments released on project completion
- **📊 Revenue Tracking** - Earnings analytics for freelancers

---

## 🔄 System Flow

```mermaid
graph LR
    A[Client Adds Money] --> B[Accept Freelancer Bid]
    B --> C[Money Auto-Frozen]
    C --> D[Project Completion]
    D --> E[Payment Auto-Released]
    E --> F[Freelancer Revenue Updated]
    F --> G[Freelancer Withdraws]
```

---

## 🏗️ Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend"
        A[Client Dashboard] 
        B[Freelancer Dashboard]
    end
    
    subgraph "APIs"
        C[Wallet APIs]
        D[Revenue APIs]
    end
    
    subgraph "Database"
        E[(Wallet)]
        F[(Transactions)]
        G[(Frozen Amounts)]
    end
    
    A --> C
    B --> D
    C --> E
    C --> F
    C --> G
    D --> F
```

---

## 🌟 Real-Life Example

### **Scenario: Sarah hires John for website development**

```mermaid
sequenceDiagram
    participant S as Sarah (Client)
    participant W as Wallet System
    participant J as John (Freelancer)
    
    S->>W: Adds $5000 to wallet
    Note over S,W: Wallet: $5000 available
    
    S->>W: Accepts John's $1500 bid
    Note over S,W: Auto-freeze: $3500 available, $1500 frozen
    
    Note over S,J: John completes website
    
    S->>W: Marks project complete
    W->>J: Auto-releases $1500
    Note over J,W: John's balance: $1500
    
    J->>W: Withdraws $1000
    Note over J,W: John's balance: $500
```

### **Step-by-Step Process:**

1. **💰 Sarah adds money**: `$5000` → Wallet balance
2. **🤝 Bid acceptance**: John bids `$1500` → Sarah accepts
3. **🔒 Auto-freeze**: `$1500` frozen, `$3500` available
4. **✅ Project completion**: Sarah marks complete
5. **💸 Auto-release**: `$1500` → John's wallet
6. **📊 Revenue tracking**: John's total earnings updated
7. **🏦 Withdrawal**: John withdraws `$1000`

---

## 🔌 Key APIs

| API | Role | Purpose |
|-----|------|---------|
| `POST /api/wallet/add-money` | CLIENT | Add money to wallet |
| `GET /api/wallet/{userId}` | BOTH | Check wallet balance |
| `POST /api/wallet/withdraw` | FREELANCER | Withdraw earnings |
| `GET /api/freelancer/revenue/{id}` | FREELANCER | View earnings stats |
| `GET /api/wallet/frozen-amounts/{id}` | CLIENT | View frozen payments |

### **Automatic Triggers:**
- **Bid Acceptance** → Auto-freezes money
- **Project Completion** → Auto-releases payment

---

## 💡 Benefits

- **🔒 Secure**: Funds protected during project execution
- **⚡ Automatic**: No manual payment processing needed
- **📊 Transparent**: Clear revenue tracking for freelancers
- **🛡️ Safe**: Role-based access control
- **💰 Efficient**: Instant payments on completion

---

**Built for WorkOrbit Platform** 🚀
