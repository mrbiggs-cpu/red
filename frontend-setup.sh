# Create Next.js project
npx create-next-app@latest dashboard-frontend --typescript --tailwind --eslint

# Navigate to project
cd dashboard-frontend

# Install shadcn/ui and dependencies
npm install @shadcn/ui lucide-react next-themes class-variance-authority clsx tailwind-merge

# Install authentication dependencies
npm install jsonwebtoken axios

# Install dev dependencies
npm install -D @types/jsonwebtoken 