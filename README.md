# World Life — Life Simulation (React + Vite)

A deep, realistic life simulation game rewritten as a React application with Vite, TypeScript, and a bespoke dark luxury interface.

## Features Ported
- **Character Genesis & Background**: Begin life at age 6 in one of 13 authentic countries (Egypt, USA, Saudi Arabia, UAE, UK, Germany, Canada, Australia, France, Japan, Italy, Brazil, India) with realistic economic baselines, exchange rates, currency, cost of living, and family wealth tiers.
- **Pacing Engine**: Advance through life either on an annual pace or on an authentic 12-month calendar pace with seasonal shifts, monthly bills, and year-end fast forwarding.
- **Vitals & Well-being System**: Dynamic derived happiness mood system, physical health, smarts, and social vitality bars with animated progress trackers.
- **Career & Education**:
  - Primary and secondary education, high school / thanaweya amma examinations, university degrees (CS, Engineering, Medicine, Business, Law, Biology, etc.), study abroad programs.
  - Job applications, performance evaluations, raises, promotions, part-time hustles, and Gulf overseas contract sponsorship.
- **Financial Architecture**:
  - Multi-currency banking, savings deposits with monthly interest, credit cards, mortgages, and loans.
  - Real estate market: renting, purchasing villas/apartments, tenant management, and renovations.
  - Vehicle dealerships: buying, maintaining, insuring, and selling cars.
  - Assets and gold bullion hedges against currency devaluation.
  - Shopping: Electronics, luxury goods, pets, lifestyle items.
- **Relationships & Family**:
  - Parents, siblings, and extended family dynamics with gift-giving, financial support, and bonding.
  - Romance & Marriage: Dating pool, proposals, weddings, dowry/mahr, in-law relationships, visa marriages, and divorce.
  - Children: Raising children, education choices, activities, and bonding.
  - Friends circle: Hangouts, lending money, and group activities.
- **Global Life & Healthcare**:
  - Medical treatments, checkups, surgeries, and physical fitness routines.
  - Travel and domestic/international vacations.
  - Immigration visas, relocation, and expat life.
- **Decision Encounters & Life Story**:
  - High-stakes critical decision events with keyboard shortcuts (A, B, C, D).
  - Chronological Life Log with reflections (💭), remembered moments (📌), and life milestones.

## Development & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Deploying to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes your site automatically:

1. In your GitHub repository (`Elsayedhawaa/life-sim`), go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push or sync your changes to the `main` branch. GitHub Actions will build and deploy the game to your GitHub Pages URL automatically with zero manual setup.

## Static / Standalone Compatibility

The application is structured so that:
- Asset and script references use relative paths (`./`) compatible with custom domains, subpaths, and GitHub Pages.
- Both `dist/` (compiled React bundle) and root static files are supported with fallback containers and ErrorBoundary guards so the screen never goes blank.
