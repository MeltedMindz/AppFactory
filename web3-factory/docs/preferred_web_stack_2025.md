# Web3 Factory Preferred Web App Stack (2025)

**Version**: 1.0  
**Status**: GUIDANCE FOR W3 & W5 STAGES  
**Purpose**: Define modern, production-ready web app architecture patterns for Web3 Factory

## 🎯 Stack Overview

The Web3 Factory Preferred Stack prioritizes:
- **Developer Experience**: Fast development cycles with excellent tooling
- **Performance**: Core Web Vitals compliance and optimal loading
- **Accessibility**: WCAG 2.1 AA compliance by default
- **Production Readiness**: Real apps, not demos or prototypes
- **Maintainability**: Clean architecture that scales with complexity
- **Web3 Integration**: Seamless Solana wallet and token operations

## 🚀 Core Framework Recommendation

### Primary: Next.js 14+ (App Router)

**Choose for**: 95% of Web3 Factory apps

**Why Next.js dominates in 2025**:
- ✅ **React Server Components**: Reduced client-side JavaScript bundle
- ✅ **Hybrid Rendering**: SSR/SSG/ISR support for optimal performance
- ✅ **Built-in Optimization**: Automatic code splitting, image optimization
- ✅ **Production Ready**: Zero-config deployment to Vercel, Netlify, AWS
- ✅ **SEO Excellence**: Server-side rendering for Web3 marketing pages
- ✅ **TypeScript First**: Full TypeScript support with zero configuration

**Next.js Configuration**:
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@solana/web3.js']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

export default nextConfig;
```

### Alternative: Vite + React 18+

**Choose for**: Simple apps with minimal backend needs, rapid prototyping

**Vite Advantages**:
- ⚡ **Lightning Fast**: Sub-second dev server startup
- 📦 **Smaller Bundles**: Tree-shaking and rollup optimization
- 🔧 **Flexible**: Easy customization and plugin ecosystem
- 📱 **Client-First**: Perfect for SPAs with external APIs

**When to use Vite over Next.js**:
- Pure frontend app with no SEO requirements
- Simple token interactions without complex backend logic
- Rapid prototyping or proof-of-concept builds

## 🎨 UI Component Architecture

### Recommended: Headless Components + Tailwind CSS

**Primary Stack**: 
```typescript
// Core dependencies
"@radix-ui/react-dialog": "^1.0.5",
"@radix-ui/react-popover": "^1.0.7", 
"@radix-ui/react-select": "^2.0.0",
"@radix-ui/react-toast": "^1.1.5",
"class-variance-authority": "^0.7.0",
"clsx": "^2.0.0",
"lucide-react": "^0.263.1",
"tailwind-merge": "^1.14.0",
"tailwindcss": "^3.3.0"
```

**Why this combination**:
- 🎯 **Radix UI**: Unstyled, accessible primitives (dialogs, popovers, forms)
- 🎨 **Tailwind CSS**: Utility-first styling with design system consistency
- 🔧 **Class Variance Authority**: Type-safe component variants
- ♿ **Built-in Accessibility**: WCAG 2.1 AA compliance out of the box
- 📱 **Responsive by Default**: Mobile-first responsive design

**Component Example**:
```typescript
// components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Alternative: shadcn/ui

**For teams wanting pre-built components**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog form
```

## 🔗 Solana Integration Architecture

### Wallet Adapter Setup (2025 Best Practices)

**Core Dependencies**:
```typescript
"@solana/wallet-adapter-base": "^0.9.23",
"@solana/wallet-adapter-react": "^0.15.35", 
"@solana/wallet-adapter-react-ui": "^0.9.35",
"@solana/wallet-adapter-wallets": "^0.19.32",
"@solana/web3.js": "^1.87.6"
```

**Provider Configuration**:
```typescript
// components/WalletProvider.tsx
'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Token Operations Hook

```typescript
// hooks/useTokenOperations.ts
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, transfer } from '@solana/spl-token';

export function useTokenOperations(tokenMint: string) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const getTokenBalance = async () => {
    if (!publicKey) return 0;
    
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(tokenMint),
        publicKey
      );
      const account = await getAccount(connection, tokenAccount);
      return Number(account.amount) / Math.pow(10, 9); // Adjust for decimals
    } catch (error) {
      return 0; // Account doesn't exist or other error
    }
  };

  const transferTokens = async (recipient: string, amount: number) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    // Implementation details for token transfer
    // This is a simplified example
  };

  return {
    getTokenBalance,
    transferTokens,
    isConnected: !!publicKey,
  };
}
```

## 📊 State Management Strategy

### React Built-ins First (2025 Philosophy)

**For 80% of apps**: `useState`, `useContext`, `useReducer`

```typescript
// context/AppStateContext.tsx
interface AppState {
  user: User | null;
  tokenBalance: number;
  isLoading: boolean;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppStateContext = React.createContext<AppContextType | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}
```

### For Complex State: Zustand

**When to add**: Deep component trees, complex async operations

```typescript
// store/appStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppStore {
  walletConnected: boolean;
  tokenBalance: number;
  setWalletConnected: (connected: boolean) => void;
  updateTokenBalance: (balance: number) => void;
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set) => ({
    walletConnected: false,
    tokenBalance: 0,
    setWalletConnected: (connected) => set({ walletConnected: connected }),
    updateTokenBalance: (balance) => set({ tokenBalance: balance }),
  }))
);
```

## 🚨 Error Boundaries & Loading States

### Error Boundary Implementation

```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return (
        <Fallback 
          error={this.state.error!} 
          reset={() => this.setState({ hasError: false, error: null })} 
        />
      );
    }

    return this.props.children;
  }
}
```

### Loading States Pattern

```typescript
// components/LoadingStates.tsx
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function TokenBalanceLoader() {
  return (
    <div className="flex items-center space-x-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      <span className="text-sm text-muted-foreground">Loading balance...</span>
    </div>
  );
}
```

## ♿ Accessibility Requirements (MANDATORY)

### WCAG 2.1 AA Compliance Checklist

**Required for all components**:
- ✅ **Semantic HTML**: Use proper HTML5 elements
- ✅ **Keyboard Navigation**: All interactive elements keyboard accessible
- ✅ **Color Contrast**: 4.5:1 ratio for normal text, 3:1 for large text
- ✅ **Focus Management**: Visible focus indicators, logical tab order
- ✅ **Screen Reader Support**: Proper ARIA labels and descriptions
- ✅ **Alternative Text**: All images have descriptive alt text

**Testing Requirements**:
```typescript
// __tests__/accessibility.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WalletConnection } from '@/components/WalletConnection';

expect.extend(toHaveNoViolations);

test('WalletConnection should be accessible', async () => {
  const { container } = render(<WalletConnection />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚀 Performance Standards (MANDATORY)

### Core Web Vitals Targets

**Required Performance Metrics**:
- 🎯 **Largest Contentful Paint (LCP)**: < 2.5 seconds
- 🎯 **First Input Delay (FID)**: < 100 milliseconds  
- 🎯 **Cumulative Layout Shift (CLS)**: < 0.1
- 🎯 **First Contentful Paint (FCP)**: < 1.8 seconds

**Next.js Performance Config**:
```typescript
// next.config.js
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Bundle Size Optimization

**Bundle Analysis**:
```bash
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

**Code Splitting Strategy**:
```typescript
// Dynamic imports for large components
const WalletModal = dynamic(() => import('@/components/WalletModal'), {
  loading: () => <WalletModalSkeleton />,
});

const TokenChart = dynamic(() => import('@/components/TokenChart'), {
  ssr: false, // Client-side only for chart libraries
});
```

## 🛡️ Security Best Practices

### Environment Variables

```typescript
// .env.example
# Public variables (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=

# Server-side only (no prefix)
BAGS_API_KEY=
CREATOR_WALLET_PRIVATE_KEY=
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.mainnet-beta.solana.com;",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## 📱 Responsive Design Standards

### Breakpoint Strategy

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Very large desktop
    },
  },
};
```

### Mobile-First Components

```typescript
// components/ResponsiveLayout.tsx
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      px-4 py-6           /* Mobile: 16px padding, 24px vertical */
      sm:px-6 sm:py-8     /* Mobile landscape: 24px padding, 32px vertical */
      lg:px-8 lg:py-12    /* Desktop: 32px padding, 48px vertical */
      max-w-7xl mx-auto   /* Constrain max width, center */
    ">
      {children}
    </div>
  );
}
```

## 🧪 Testing Strategy

### Testing Stack

```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Test Categories**:
1. **Component Tests**: React Testing Library + Jest
2. **Accessibility Tests**: jest-axe for WCAG compliance
3. **Integration Tests**: API routes and Solana interactions
4. **E2E Tests**: Playwright for user workflows

## 🚀 Deployment Configuration

### Vercel (Recommended)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "mainnet-beta"
  }
}
```

### Netlify (Alternative)

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "out"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

## 📚 Documentation Standards

### README Template

Every generated app includes:
- 🚀 **Quick Start**: `npm install` && `npm run dev`
- 🔧 **Environment Setup**: Required environment variables
- 🪙 **Token Integration**: How the token works in the app
- 🚀 **Deployment Guide**: Step-by-step platform deployment
- 🐛 **Troubleshooting**: Common issues and solutions

### Code Documentation

```typescript
/**
 * Custom hook for managing token operations
 * @param tokenMint - The Solana token mint address
 * @returns Object containing token balance and transfer functions
 * @example
 * ```typescript
 * const { tokenBalance, transferTokens } = useTokenOperations(TOKEN_MINT);
 * await transferTokens('recipient-address', 100);
 * ```
 */
export function useTokenOperations(tokenMint: string) {
  // Implementation
}
```

## 🔄 Version Management

### Dependency Updates

**Automated Updates**: Dependabot or Renovate for patch/minor updates
**Manual Review**: Major version updates require manual review
**Security**: Weekly security updates for critical vulnerabilities

**Lock File Strategy**:
- ✅ Commit `package-lock.json` for reproducible builds
- ✅ Use `npm ci` in production builds
- ✅ Regular `npm audit` checks

---

## 🎯 Implementation Notes

**This is guidance, not enforcement**. Generated apps use this preferred stack but creators can:
- ✅ Modify any part of the generated code
- ✅ Add additional libraries or frameworks  
- ✅ Change styling systems or state management
- ✅ Customize deployment configuration

**The goal**: Generate production-ready starting points that follow 2025 best practices while remaining fully customizable post-generation.