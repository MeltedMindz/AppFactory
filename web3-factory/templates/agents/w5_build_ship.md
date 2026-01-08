# W5: Build & Ship

## AGENT-NATIVE EXECUTION
You are Claude executing W5 for Web3 Factory. Generate complete production-ready web app and create Solana token via Bags SDK.

## CRITICAL: TOKEN CREATION STAGE

W5 is the ONLY stage that creates tokens. All previous stages are configuration only.

**TOKEN CREATION RESPONSIBILITIES**:
1. Execute token creation via Bags SDK
2. Capture and persist token address
3. Wire token into app functionality
4. Generate complete production-ready web app

## INPUTS
- Read: `web3-factory/runs/.../w1/web3_idea.json`
- Read: `web3-factory/runs/.../w2/token_model.json`
- Read: `web3-factory/runs/.../w3/web3_architecture.json`
- Read: `web3-factory/runs/.../w4/bags_config.json`

## OUTPUTS
- Write: `web3-factory/runs/.../w5/build_manifest.json`
- Write: `web3-factory/runs/.../w5/w5_execution.md`
- Create: `web3-factory/builds/<app_name>/` (complete web app)
- Create: `web3-factory/builds/<app_name>/token_metadata.json` (created token details)

## BUILD OUTPUT STRUCTURE (MANDATORY - 2025 PRODUCTION STANDARDS)

**Reference**: Follow patterns from `docs/preferred_web_stack_2025.md`

Generate complete production-ready web app at `web3-factory/builds/<app_name>/`:

```
web3-factory/builds/<app_name>/
├── package.json                    # Complete dependencies with exact versions
├── package-lock.json               # Locked dependency versions
├── next.config.js                  # Next.js config (if Next.js) with security headers
├── vite.config.js                  # Vite config (if Vite) with optimization
├── tailwind.config.js              # Tailwind config with design system
├── tsconfig.json                   # TypeScript configuration
├── .env.example                    # Environment variables template
├── .env.local.example              # Local development template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore with security patterns
├── README.md                       # Comprehensive setup guide
├── DEPLOYMENT.md                   # Platform-specific deployment guides
├── public/
│   ├── favicon.ico                 # Optimized favicon
│   ├── robots.txt                  # SEO crawling directives
│   ├── sitemap.xml                 # Generated sitemap
│   └── metadata/                   # Token and app metadata files
├── src/
│   ├── app/                        # Next.js App Router (if Next.js)
│   │   ├── layout.tsx              # Root layout with providers
│   │   ├── page.tsx                # Homepage
│   │   ├── globals.css             # Global styles
│   │   └── [...pages]              # App-specific pages
│   ├── components/
│   │   ├── ui/                     # Base UI components (Radix + Tailwind)
│   │   │   ├── Button.tsx          # Variant-based button component
│   │   │   ├── Dialog.tsx          # Accessible dialog component
│   │   │   └── [other-ui-components]
│   │   ├── providers/              # Context providers
│   │   │   ├── WalletProvider.tsx  # Solana wallet integration
│   │   │   └── ErrorBoundary.tsx   # Error boundary wrapper
│   │   ├── wallet/                 # Wallet-specific components
│   │   │   ├── WalletConnection.tsx
│   │   │   ├── WalletButton.tsx
│   │   │   └── WalletModal.tsx
│   │   ├── token/                  # Token-specific components
│   │   │   ├── TokenBalance.tsx
│   │   │   ├── TokenActions.tsx
│   │   │   └── TransactionHistory.tsx
│   │   └── features/               # Feature-specific components
│   ├── hooks/
│   │   ├── useWallet.ts           # Wallet connection hook
│   │   ├── useToken.ts            # Token operations hook
│   │   ├── useTransactions.ts     # Transaction management
│   │   └── useLocalStorage.ts     # Persistent state hook
│   ├── lib/                        # Utility libraries
│   │   ├── utils.ts               # Common utilities and cn helper
│   │   ├── constants.ts           # App and token constants
│   │   ├── validations.ts         # Input validation schemas
│   │   └── types.ts               # TypeScript type definitions
│   ├── services/
│   │   ├── bags.ts                # Bags SDK integration
│   │   ├── solana.ts              # Solana connection management
│   │   ├── token.ts               # Token operation utilities
│   │   └── api.ts                 # API client utilities
│   └── styles/
│       ├── globals.css            # Global CSS with CSS variables
│       └── components.css         # Component-specific styles
├── tests/                          # Test suite
│   ├── __tests__/                 # Unit tests
│   ├── components/                # Component tests
│   ├── e2e/                       # End-to-end tests
│   ├── setup.ts                   # Test setup
│   └── utils.ts                   # Test utilities
├── docs/                           # Additional documentation
│   ├── token-integration.md       # Token integration guide
│   ├── development.md             # Development workflow
│   └── troubleshooting.md         # Common issues and solutions
├── token/                          # Token creation artifacts
│   ├── token_plan.json            # Token creation plan
│   ├── bags_config.json           # Exact Bags SDK configuration
│   ├── token_receipt.json         # Creation receipt
│   └── token_receipt.md           # Human-readable token info
└── .github/                       # GitHub workflows (optional)
    └── workflows/
        ├── ci.yml                 # Continuous integration
        └── deploy.yml             # Deployment workflow
```

## JSON SCHEMA
```json
{
  "type": "object",
  "properties": {
    "build_execution": {
      "type": "object",
      "properties": {
        "app_name": {"type": "string"},
        "build_timestamp": {"type": "string"},
        "framework_used": {"type": "string"},
        "build_path": {"type": "string"}
      },
      "required": ["app_name", "build_timestamp", "framework_used", "build_path"]
    },
    "token_creation": {
      "type": "object",
      "properties": {
        "token_address": {"type": "string"},
        "creation_transaction": {"type": "string"},
        "creation_timestamp": {"type": "string"},
        "creator_wallet": {"type": "string"},
        "network": {"type": "string"}
      },
      "required": ["token_address", "creation_transaction", "creation_timestamp", "creator_wallet", "network"]
    },
    "app_integration": {
      "type": "object",
      "properties": {
        "token_integrated": {"type": "boolean"},
        "wallet_connection_working": {"type": "boolean"},
        "balance_display_working": {"type": "boolean"},
        "token_actions_implemented": {"type": "boolean"},
        "fee_routing_active": {"type": "boolean"}
      },
      "required": ["token_integrated", "wallet_connection_working", "balance_display_working", "token_actions_implemented", "fee_routing_active"]
    },
    "production_readiness": {
      "type": "object",
      "properties": {
        "environment_configured": {"type": "boolean"},
        "error_handling_complete": {"type": "boolean"},
        "responsive_design": {"type": "boolean"},
        "deployment_ready": {"type": "boolean"}
      },
      "required": ["environment_configured", "error_handling_complete", "responsive_design", "deployment_ready"]
    }
  },
  "required": ["build_execution", "token_creation", "app_integration", "production_readiness"]
}
```

## EXECUTION STEPS (2025 PRODUCTION STANDARDS)

**Reference**: Follow patterns from `docs/preferred_web_stack_2025.md`

### Phase 1: Token Creation
1. **Initialize Bags SDK**:
   - Configure SDK with W4 parameters using exact environment variables
   - Set up idempotency system with deterministic build IDs
   - Check for existing token receipts to prevent duplicates
   - Prepare fee routing configuration with immutable partner key

2. **Create Token**:
   - Execute token creation via Bags SDK with retry logic
   - Implement exponential backoff for network failures (3 retries max)
   - Capture token address, transaction hash, and creation timestamp
   - Verify token creation on Solana with confirmation levels
   - Handle rate limiting (1,000 requests/hour) gracefully

3. **Document Token**:
   - Write complete token metadata to `builds/<app_name>/token/`
   - Generate `token_receipt.json` with deterministic build ID
   - Document fee routing (75%/25% split) with partner key proof
   - Create human-readable `token_receipt.md` for transparency
   - Create audit trail with all creation parameters

### Phase 2: Modern Web App Generation (2025 Standards)
4. **Initialize Framework (2025 Best Practices)**:
   - **Next.js 14+ Setup** (default): App Router, React Server Components, TypeScript
   - **Vite + React 18+ Setup** (simple apps): Fast dev server, modern build pipeline
   - Configure **Tailwind CSS** with design system and CSS variables
   - Set up **ESLint + Prettier** with Web3-specific rules
   - Initialize **TypeScript** with strict configuration

5. **Implement UI Component Architecture**:
   - **Base Components**: Radix UI + Tailwind CSS for accessibility
   - **Design System**: Consistent spacing, colors, typography scales
   - **Component Variants**: Use `class-variance-authority` for type-safe variants
   - **Icons**: Lucide React for modern, consistent iconography
   - **Responsive Design**: Mobile-first with proper breakpoints
   - **Dark Mode**: Support system preference with manual toggle

6. **Wallet Integration (2025 Standards)**:
   - **Solana Wallet Adapter v0.15.35+**: Latest React 18+ compatible version
   - **Multi-Wallet Support**: Phantom, Solflare, Backpack (core trinity)
   - **Mobile Wallet Adapter (MWA)**: Seamless mobile Web3 experience
   - **Auto-Connect**: Persistent sessions for returning users
   - **Error Recovery**: Graceful handling with retry mechanisms
   - **Progressive Enhancement**: App works without wallet for read-only features

### Phase 3: Advanced Integration & Performance
7. **Implement Solana Integration**:
   - **Connection Management**: Connection pooling with RPC fallbacks
   - **Token Operations**: Balance queries with SWR/TanStack Query caching
   - **Transaction Handling**: Simulation before sending, priority fees support
   - **State Management**: React built-ins first, Zustand for complex apps
   - **Error Boundaries**: Component-level error recovery

8. **Token Behavior Implementation**:
   - Map token role to app functionality with clear user flows
   - Implement spending/earning mechanisms with optimistic updates
   - Configure fee routing in app transactions (75%/25% split enforcement)
   - Handle edge cases: zero balance, network errors, transaction failures
   - Add transaction confirmation flows with status tracking

9. **Performance Optimization (Core Web Vitals)**:
   - **Code Splitting**: Route-based and component-based dynamic imports
   - **Bundle Analysis**: Keep initial JavaScript < 200KB gzipped
   - **Image Optimization**: Next.js Image component or modern image formats
   - **Caching Strategy**: Aggressive static asset caching, smart RPC caching
   - **Critical CSS**: Inline critical styles, defer non-critical
   - **Web Vitals Monitoring**: Track LCP < 2.5s, FID < 100ms, CLS < 0.1

### Phase 4: Production Hardening (2025 Standards)
10. **Security & Error Handling**:
    - **Content Security Policy**: Prevent XSS attacks with strict headers
    - **Error Boundaries**: Graceful degradation with fallback UI
    - **Input Validation**: Client-side validation with schema validation
    - **Environment Security**: Proper secrets management, no hardcoded keys
    - **Dependency Security**: Regular security audits of npm packages

11. **Testing & Quality Assurance**:
    - **Unit Tests**: React Testing Library for component testing
    - **Accessibility Tests**: jest-axe for automated accessibility checking
    - **E2E Tests**: Playwright for critical user flows (wallet connection, transactions)
    - **Performance Tests**: Lighthouse CI for Core Web Vitals monitoring
    - **Type Safety**: Zero TypeScript errors with strict configuration

12. **Documentation & Deployment Readiness**:
    - Generate comprehensive README with setup instructions
    - Create deployment guides for Vercel, Netlify, AWS, IPFS
    - Document token integration patterns and troubleshooting
    - Provide environment variable templates (.env.example)
    - Include development workflow documentation
    - Add GitHub Actions workflow for CI/CD (optional)

## TOKEN INTEGRATION PATTERNS

### ACCESS Token Integration
```javascript
// Example: Unlock premium features
const hasAccess = tokenBalance >= FEATURE_COST;
const unlockFeature = () => {
  if (hasAccess) {
    // Spend tokens to unlock
    transferTokens(FEATURE_COST);
    // Grant access
  }
};
```

### USAGE Token Integration
```javascript
// Example: Pay per action
const performAction = async () => {
  if (tokenBalance >= ACTION_COST) {
    await transferTokens(ACTION_COST);
    // Perform the action
  } else {
    // Show insufficient balance message
  }
};
```

### FEE CAPTURE Token Integration
```javascript
// Example: Distribute fees to token holders
const distributeFees = async (totalFees) => {
  const creatorShare = totalFees * 0.75; // 75% to creator
  const partnerShare = totalFees * 0.25; // 25% to App Factory partner
  // Route fees according to configuration (partner key: FDYcVLxHkekUFz4M29hCuBH3vbf1aLm62GEFZxLFdGE7)
};
```

## PRODUCTION REQUIREMENTS

### Dependencies (2025 Production Standards)

**Core Framework (Choose ONE)**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.1.0",
    "typescript": "^5.3.0"
  }
}
```

**OR for Vite + React**:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vite": "^5.1.0",
    "typescript": "^5.3.0"
  }
}
```

**Solana & Web3 (Required)**:
```json
{
  "dependencies": {
    "@solana/web3.js": "^1.87.0",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.34",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/wallet-adapter-base": "^0.9.23",
    "bags-sdk": "latest"
  }
}
```

**UI & Styling (2025 Standards)**:
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-toast": "^1.1.5",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.307.0"
  }
}
```

**State & Data Fetching (Modern)**:
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "swr": "^2.2.4"
  }
}
```

**Development & Quality (Required)**:
```json
{
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.2.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@playwright/test": "^1.41.0"
  }
}
```

### Error Handling (2025 Production Standards)

**Critical Error Scenarios (Must Handle)**:
- **Wallet Connection**: Connection refused, wallet locked, wrong network
- **Network Issues**: RPC unavailable, timeout, rate limiting, connection drops
- **Transaction Failures**: Insufficient SOL, simulation failed, slippage exceeded
- **Token Operations**: Insufficient balance, token account not found, program errors
- **Application Errors**: Component crashes, data corruption, state inconsistency

**Error Recovery Patterns**:
```typescript
// Example: Comprehensive error boundary
class AppErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service (client-side only)
    console.error('App Error:', { error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**User Experience Error Handling**:
- **Toast Notifications**: Non-blocking error messages with action buttons
- **Inline Validation**: Real-time form validation with helpful messages
- **Retry Mechanisms**: Exponential backoff with manual retry options
- **Graceful Degradation**: App continues working with reduced functionality
- **Clear Recovery Steps**: Specific instructions for error resolution

### Performance Requirements (2025 Core Web Vitals)

**Mandatory Performance Targets**:
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds
- **Time to Interactive (TTI)**: < 5 seconds

**Web3-Specific Performance**:
- **Wallet connection**: < 5 seconds on fast connection, < 10 seconds on slow
- **Token balance fetch**: < 3 seconds with caching, < 1 second on subsequent loads
- **Transaction confirmation**: < 30 seconds (network dependent, with progress indicators)
- **RPC call response**: < 2 seconds with timeout handling
- **Bundle size**: Initial JavaScript < 200KB gzipped

**Mobile Performance Targets**:
- **Mobile LCP**: < 3.5 seconds on 3G connection
- **Touch response**: < 50ms interaction delay
- **Viewport stability**: No layout shifts during wallet connection
- **Offline capability**: Graceful handling of network loss

**Performance Monitoring**:
```typescript
// Example: Core Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to monitoring service
  console.log('Performance metric:', metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## SUCCESS CRITERIA (2025 PRODUCTION STANDARDS)

W5 is successful when:

### Token Creation & Integration
- [ ] Token successfully created via Bags SDK with proper error handling
- [ ] Token address captured and persisted in deterministic receipt format
- [ ] Token meaningfully integrated into app behavior (not decorative)
- [ ] Fee routing (75%/25%) implemented and documented with immutable partner key FDYcVLxHkekUFz4M29hCuBH3vbf1aLm62GEFZxLFdGE7
- [ ] Idempotency system prevents duplicate token creation on re-runs

### Web App Quality & Performance
- [ ] Complete production-ready web app generated with modern architecture
- [ ] Core Web Vitals targets met: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Mobile-responsive design with touch-optimized interactions
- [ ] Accessibility compliance (WCAG 2.1 AA) with proper ARIA labels
- [ ] TypeScript implementation with zero type errors

### Wallet & Solana Integration
- [ ] Multi-wallet support (Phantom, Solflare, Backpack) with Mobile Wallet Adapter
- [ ] Graceful error handling for all Web3-specific failure modes
- [ ] Real-time token balance updates with proper caching
- [ ] Transaction flows with confirmation tracking and retry mechanisms
- [ ] Network switching support (mainnet/devnet) with proper environment handling

### Production Readiness
- [ ] Comprehensive error boundaries with user-friendly fallback UI
- [ ] Security headers implemented (CSP, HSTS, X-Frame-Options)
- [ ] Environment configuration with .env.example template
- [ ] Test suite covering critical paths (wallet connection, token operations)
- [ ] Build optimization: bundle size < 200KB gzipped

### Documentation & Deployment
- [ ] README with complete setup, development, and deployment instructions
- [ ] Platform-specific deployment guides (Vercel, Netlify, AWS, IPFS)
- [ ] Token integration documentation with troubleshooting section
- [ ] Environment variable documentation with security best practices
- [ ] Development workflow documentation for contributors

## FAILURE CONDITIONS (2025 STANDARDS)

STOP execution immediately if:

### Token Creation Failures
- **Bags SDK integration fails**: API errors, authentication issues, network problems
- **Token parameters invalid**: Schema validation failures, missing required fields
- **Fee routing misconfiguration**: Partner key mismatch, percentage calculation errors
- **Idempotency system failure**: Cannot verify existing tokens or prevent duplicates
- **Transaction verification fails**: Cannot confirm token creation on Solana network

### Web App Generation Failures
- **Framework initialization fails**: Next.js/Vite setup errors, dependency conflicts
- **Build system failures**: TypeScript compilation errors, bundling failures
- **Critical component errors**: Wallet integration, token operations, core UI broken
- **Performance requirements not met**: Core Web Vitals targets exceeded
- **Accessibility failures**: WCAG 2.1 AA compliance violations

### Integration & Quality Failures
- **Token integration incomplete**: Token not functionally wired to app behavior
- **Security vulnerabilities**: Missing security headers, exposed secrets
- **Mobile compatibility issues**: Responsive design failures, touch interaction problems
- **Test failures**: Critical path tests failing, type checking errors
- **Documentation incomplete**: Missing setup instructions or deployment guides

### Recovery Actions
When failure occurs:
1. **Write detailed failure analysis** to `builds/<app_name>/build_failure.md`
2. **Include specific error messages** with stack traces and context
3. **Provide remediation steps** with exact commands to resolve issues
4. **Document environment requirements** and dependency conflicts
5. **Create recovery checklist** for manual resolution

### Failure Report Format
```markdown
# Build Failure Report

## Failure Type
[Token Creation / Web App Generation / Integration / Quality]

## Error Details
[Exact error messages and stack traces]

## Environment Context
[Node version, dependencies, network settings]

## Remediation Steps
1. [Specific command or fix]
2. [Verification step]
3. [Retry command]

## Prevention
[How to avoid this issue in future builds]
```

**CRITICAL**: Never claim success with incomplete builds. Production apps must meet ALL success criteria.

DO NOT output JSON in chat. Write all artifacts to disk only.