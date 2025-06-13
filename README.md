## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* **Node.js**: [LTS version recommended](https://nodejs.org/en/download/) (includes npm)
* **npm** or **pnpm**: npm comes with Node.js, or you can install pnpm globally (`npm install -g pnpm`).

### Installation
1.  Clone this repository to your local machine:
    ```bash
    git clone git@github.com:Guribeiro/chat-sys.git
    cd chat-sys
    ```
2.  Install the project dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

---

## Environment Variables
This project uses environment variables to manage configuration settings, such as the application title and API URLs. A `.env.example` file is provided to show you the required variables.

### `.env.example`
```dotenv
VITE_APP_TITLE=My App (development)
VITE_API_URL=http://localhost:2018