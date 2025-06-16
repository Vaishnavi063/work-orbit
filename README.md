# WorkOrbit

WorkOrbit is a platform connecting clients and freelancers through a streamlined bidding system.

## Overview

WorkOrbit enables clients to post jobs and freelancers to bid on them, facilitating transparent project management from proposal to contract.

### Core Workflow

1. **Client posts a job**  
    - Fields: Title, Description, Budget, Category, Deadline
2. **Freelancer views job listings**
3. **Freelancer places a bid**  
    - Proposal text, Bid amount, Expected delivery time
4. **Client reviews bids**  
    - Accept or reject any bid
5. **Bid accepted**  
    - Contract/Order is created  
    - Job marked as "In Progress"  
    - Job locked (no further bids allowed)

## Tech Stack

- **Frontend:** React (Vite, pnpm)
- **Backend:** Spring Boot (Java)
- **Frontend IDE:** VS Code
- **Backend IDE:** Eclipse

> **Note:** The project root contains both `frontend/` and `backend/` directories.

## Getting Started

### Prerequisites

- Node.js, pnpm, Java 17+, Maven/Gradle

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

### Backend Setup

1. Import `backend/` into Eclipse as a Spring Boot project.
2. Configure database settings as needed.
3. Run the application from Eclipse.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.