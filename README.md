<h1 align="center" id="title">MauLocum</h1>

## <p id="description"> Modern platform that connects doctors with healthcare facilities for locum job opportunities</p>

<h2>🧐 Features</h2>

*  ####  🧑‍⚕️ Locum Jobs discovery
*  ####  🏢 Facility job postings & candidate management
*  #### 🔒 Secure authentication
*  ####  🥷 Anonymous review for both parties
*   #### 💼 Verified professional only

<h2>Project Screenshots:</h2>

<img src="https://i.imgur.com/Xr03pQM.png" alt="project-screenshot" width="900" height="500/">

<img src="https://i.imgur.com/wMrRnOe.png" alt="project-screenshot" width="900" height="500/">
  
 

<h2>🛠️ Installation Steps:</h2>


<p>1. Open terminal and clone the repo</p>

```bash
git clone https://github.com/krekz/maulocum.git
cd maulocum
```

<p>2. Install all the project dependencies</p>

> [!IMPORTANT]  
> Ensure you are using **BUN** as package manager. Please download it [here](https://bun.sh/)

```bash
bun install
```

<p>3. Set up your environment variables</p>

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env
```

> [!NOTE]  
> Open `.env` and configure the following:
> - `DATABASE_URL` 
> - `DIRECT_URL`
> - Other required API keys and secrets

<p>4. Set up the database</p>

Run Prisma migrations to create your database schema:

```bash
bunx prisma migrate dev
```

This command will:
- Create the database if it doesn't exist
- Run all pending migrations
- Generate Prisma Client

<p>5. Seed the database with sample data</p>

Populate your database with test data (optional but recommended for development):

```bash
bun run seed
```

This will create:
- 1 default clinic owner account (`clinic.owner@maulocum.com`)
- 1 clinic facility (DEFAULT_Klinik Kesihatan Utama)
- 5 sample job listings with various specialties

<p>6. Start the development server</p>

```bash
bun dev
```

The app will be available at `http://localhost:3000`

---

### 🗄️ Database Commands Reference

Here are the most common Prisma commands you'll need:

```bash
# Generate Prisma Client after schema changes
bunx prisma generate

# Create a new migration after changing schema.prisma
bunx prisma migrate dev --name your_migration_name

# Open Prisma Studio to view/edit data visually
bunx prisma studio

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset

# Seed database with sample data
bun run seed
```

> [!WARNING]  
> **Never use `prisma db push` in this project!** Always use `prisma migrate dev` to create proper migration files that can be tracked in git and deployed safely.

<h2>🍰 Contribution Guidelines:</h2>

Welcome to Maulocum’s codebase! We’re stoked you want to contribute. To keep things clean and organized, please follow these simple rules:

- **Git Branches:** Always create a new branch for your work. Use descriptive names like `feature/login-page` or `fix/navbar-bug`.  
- **Commit Messages:** Use **conventional commit style** to make history easy to read and automate changelogs. Start your commit messages with one of these prefixes followed by a colon and a short description:

  - `feat:` — A new feature  
  - `fix:` — A bug fix  
  - `docs:` — Documentation changes  
  - `style:` — Formatting, missing semi-colons, etc (no code change)  
  - `refactor:` — Code change that neither fixes a bug nor adds a feature  
  - `test:` — Adding or correcting tests  
  - `chore:` — Maintenance tasks, build scripts, etc  

  **Examples:**

  - `feat: add login authentication`  
  - `fix: resolve navbar dropdown bug`  
  - `docs: update README with contribution guide`  
  - `style: format code with prettier`  
  - `refactor: simplify user profile component`  
  - `test: add tests for API endpoints`  
  - `chore: update dependencies`

- **Code Quality:** Write clean, readable code. Follow existing style and best practices.  
- **Pull Requests:** Provide a clear description of what you changed and why. Reference any related issues.  
- **Be Respectful:** Open source is all about collaboration. Keep feedback constructive and polite.

Thanks for helping make Maulocum awesome!

  
  
<h2>💻 Built with</h2>

Technologies used in the project:

*   NextJs
*   Prisma ORM
*   PostgreSQL
*   Supabase
*   TailwindCSS
*   HonoJs (ExpressJs alternative)
*  Biome (Lint and Format)
