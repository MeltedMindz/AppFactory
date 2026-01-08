# W3: App Architecture (Web)

## AGENT-NATIVE EXECUTION
You are Claude executing W3 for Web3 Factory. Define complete web app architecture with Solana integration for the tokenized concept.

## TARGET FRAMEWORKS (MANDATORY - 2025 UPDATED)

**Reference**: See `docs/preferred_web_stack_2025.md` for complete modern web app guidance.

Choose EXACTLY ONE primary framework:

### Next.js 14+ with App Router (Strongly Recommended)
- **React Server Components**: Reduced client-side JavaScript bundles
- **Hybrid Rendering**: SSR/SSG/ISR support for optimal Core Web Vitals
- **Built-in Optimization**: Automatic code splitting, image optimization
- **TypeScript First**: Zero-config TypeScript support with excellent DX
- **Web3 Integration**: Proven patterns for Solana wallet adapter
- **SEO Excellence**: Server-side rendering for Web3 marketing pages
- **Production Ready**: Zero-config deployment to Vercel, Netlify, AWS

### Vite + React 18+ (For Simple Apps)
- **Lightning Fast**: Sub-second dev server startup, HMR
- **Modern Build**: ES modules, tree-shaking, optimized bundles  
- **Flexible Architecture**: Easy customization and plugin ecosystem
- **SPA Focus**: Perfect for client-only apps with external APIs
- **Smaller Footprint**: Minimal configuration for focused use cases

**2025 Decision Criteria**: 
- **Choose Next.js** for 95% of Web3 Factory apps (default choice)
- **Choose Vite** only for simple apps with no SEO requirements and minimal backend logic
- **Modern Focus**: Both options now prioritize React 18+, TypeScript, and Web3 best practices

## INPUTS
- Read: `web3-factory/runs/.../w1/web3_idea.json`
- Read: `web3-factory/runs/.../w2/token_model.json`

## OUTPUTS
- Write: `web3-factory/runs/.../w3/web3_architecture.json`
- Write: `web3-factory/runs/.../w3/w3_execution.md`

## JSON SCHEMA
```json
{
  "type": "object",
  "properties": {
    "framework_selection": {
      "type": "object",
      "properties": {
        "primary_framework": {"enum": ["nextjs", "vite_react"]},
        "framework_version": {"type": "string"},
        "selection_rationale": {"type": "string"},
        "deployment_target": {"type": "string"}
      },
      "required": ["primary_framework", "framework_version", "selection_rationale", "deployment_target"]
    },
    "wallet_integration": {
      "type": "object",
      "properties": {
        "wallet_adapter": {"type": "string"},
        "supported_wallets": {"type": "array", "items": {"type": "string"}},
        "connection_strategy": {"type": "string"},
        "auto_connect": {"type": "boolean"}
      },
      "required": ["wallet_adapter", "supported_wallets", "connection_strategy", "auto_connect"]
    },
    "solana_integration": {
      "type": "object",
      "properties": {
        "rpc_strategy": {"type": "string"},
        "network": {"enum": ["mainnet", "devnet", "testnet"]},
        "token_program": {"type": "string"},
        "read_methods": {"type": "array", "items": {"type": "string"}},
        "write_methods": {"type": "array", "items": {"type": "string"}}
      },
      "required": ["rpc_strategy", "network", "token_program", "read_methods", "write_methods"]
    },
    "app_structure": {
      "type": "object",
      "properties": {
        "pages_screens": {"type": "array", "items": {"type": "string"}},
        "core_components": {"type": "array", "items": {"type": "string"}},
        "state_management": {"type": "string"},
        "routing_strategy": {"type": "string"},
        "ui_component_library": {"type": "string"},
        "styling_approach": {"type": "string"},
        "accessibility_strategy": {"type": "string"}
      },
      "required": ["pages_screens", "core_components", "state_management", "routing_strategy", "ui_component_library", "styling_approach", "accessibility_strategy"]
    },
    "failure_modes": {
      "type": "object",
      "properties": {
        "no_wallet_behavior": {"type": "string"},
        "rpc_unavailable_behavior": {"type": "string"},
        "network_mismatch_behavior": {"type": "string"},
        "insufficient_tokens_behavior": {"type": "string"},
        "transaction_failure_behavior": {"type": "string"}
      },
      "required": ["no_wallet_behavior", "rpc_unavailable_behavior", "network_mismatch_behavior", "insufficient_tokens_behavior", "transaction_failure_behavior"]
    },
    "performance_requirements": {
      "type": "object",
      "properties": {
        "core_web_vitals_targets": {"type": "object"},
        "bundle_size_limits": {"type": "string"},
        "initial_load_time": {"type": "string"},
        "wallet_connection_time": {"type": "string"},
        "transaction_confirmation_time": {"type": "string"},
        "offline_capabilities": {"type": "string"},
        "mobile_performance_targets": {"type": "string"}
      },
      "required": ["core_web_vitals_targets", "bundle_size_limits", "initial_load_time", "wallet_connection_time", "transaction_confirmation_time", "offline_capabilities", "mobile_performance_targets"]
    },
    "production_quality": {
      "type": "object",
      "properties": {
        "error_boundary_strategy": {"type": "string"},
        "loading_states_pattern": {"type": "string"},
        "environment_configuration": {"type": "string"},
        "security_headers": {"type": "array", "items": {"type": "string"}},
        "seo_optimization": {"type": "string"},
        "analytics_integration": {"type": "string"}
      },
      "required": ["error_boundary_strategy", "loading_states_pattern", "environment_configuration", "security_headers", "seo_optimization", "analytics_integration"]
    }
  },
  "required": ["framework_selection", "wallet_integration", "solana_integration", "app_structure", "failure_modes", "performance_requirements", "production_quality"]
}
```

## EXECUTION STEPS

### 1. Framework Selection (2025 Updated)
Based on app requirements from W1 and W2, prioritizing modern 2025 best practices:

**Choose Next.js 14+ with App Router (95% of apps)**:
- **Default Choice**: Next.js is the standard for production Web3 apps in 2025
- **React Server Components**: Reduce client-side JavaScript bundles
- **Hybrid Rendering**: SSR/SSG/ISR for optimal Core Web Vitals (LCP < 2.5s)
- **Built-in Optimization**: Automatic code splitting, image optimization, font optimization
- **Web3 Integration**: Proven patterns for Solana wallet adapter integration
- **SEO Excellence**: Server-side rendering for marketing pages and discoverability
- **TypeScript First**: Zero-config TypeScript support with excellent developer experience

**Choose Vite + React 18+ (Only if)**:
- Pure frontend SPA with external API dependencies
- No SEO requirements (internal tools, MVP prototypes)
- Extremely simple token interactions with minimal UI complexity
- Team specifically requires SPA-only architecture

**2025 Framework Decision Matrix**:
- **Complex App + SEO needed** → Next.js (App Router)
- **Simple App + SEO needed** → Next.js (Pages Router acceptable)
- **Simple App + No SEO + SPA preference** → Vite + React
- **When unsure** → Default to Next.js

### 2. Wallet Integration Design (2025 Best Practices)
Configure modern Solana wallet connectivity following 2025 standards:

**Wallet Adapter Setup (Latest SDK)**:
- Use `@solana/wallet-adapter-react` v0.15.35+ for React 18+ compatibility
- Support major wallets: **Phantom**, **Solflare**, **Backpack** (core trinity)
- Implement **Mobile Wallet Adapter (MWA)** for seamless mobile Web3 experience
- Use **auto-connect** for returning users to improve UX
- Handle **network switching** gracefully (mainnet/devnet)

**Connection Strategy (User Experience First)**:
- **Auto-connect** enabled by default for returning users
- **Clear connection prompts** with visual wallet selection UI
- **Mobile-first design** with responsive wallet modal
- **Error recovery** with retry mechanisms and clear error messages
- **Progressive enhancement** - app works without wallet for read-only features

**2025 Wallet Integration Priorities**:
1. **Mobile Experience**: MWA integration for mobile wallets
2. **User Experience**: One-click connection with persistent sessions
3. **Error Handling**: Graceful fallbacks and clear error communication
4. **Security**: Never store private keys, validate all transactions
5. **Performance**: Lazy-load wallet adapters to reduce initial bundle size

### 3. Solana Integration Architecture
Define blockchain interaction patterns:

**RPC Strategy**:
- Primary RPC endpoint configuration
- Fallback RPC providers
- Rate limiting considerations
- Connection pooling for performance

**Token Operations**:
- Read operations: Balance checking, transaction history
- Write operations: Token transfers, app-specific transactions
- Transaction signing workflow
- Error handling for failed transactions

### 4. UI Component Architecture (2025 Standards)
Define modern, accessible, and maintainable UI patterns:

**Recommended Component Library Strategy**:
- **Primary**: **Radix UI** + **Tailwind CSS** (headless + utility-first)
- **Alternative**: **shadcn/ui** (pre-built components based on Radix + Tailwind)
- **Icons**: **Lucide React** (modern, consistent icon library)
- **Typography**: System fonts with fallbacks for performance

**Why Radix + Tailwind in 2025**:
- ✅ **Accessibility First**: WCAG 2.1 AA compliance built-in
- ✅ **Customizable**: Full control over styling and behavior
- ✅ **Performance**: Headless components with minimal JavaScript
- ✅ **Developer Experience**: Excellent TypeScript support and documentation
- ✅ **Future-Proof**: Not tied to specific design trends

**Component Architecture Patterns**:
- **Compound Components**: For complex UI like dialogs, popovers
- **Polymorphic Components**: Flexible component APIs with `asChild` patterns
- **Variant-Based Design**: Use `class-variance-authority` for consistent component variants
- **Composition over Configuration**: Prefer composable, flexible component APIs

**Styling Strategy**:
- **Tailwind CSS**: Utility-first with custom design system
- **CSS Variables**: For theming and dark mode support
- **Mobile-First**: All designs start from mobile breakpoint (320px+)
- **Design System**: Consistent spacing, colors, typography scales

### 5. State Management Architecture (Modern Patterns)
Choose appropriate state strategy based on app complexity:

**React Built-ins (80% of apps)**:
- **useState**: Component-level state
- **useContext**: Cross-component state sharing
- **useReducer**: Complex state logic with actions

**External Library (Complex apps only)**:
- **Zustand**: For complex global state with TypeScript support
- **TanStack Query**: For server state management and caching
- **Avoid Redux**: Unless specifically required for existing codebase

**Data Fetching Strategy**:
- **SWR** or **TanStack Query**: For Solana RPC calls and caching
- **Native fetch**: For simple API calls
- **Optimistic Updates**: For better user experience with transactions

### 6. App Structure Definition
Based on token role from W2 and modern architectural patterns:

**Pages/Screens**:
- Landing page with wallet connection
- Main app interface
- Token balance/management screen
- Transaction history
- Settings/help

**Core Components**:
- Wallet connection component
- Token balance display
- Transaction confirmation modals
- Error boundary components
- Loading states

**State Management**:
- Wallet connection state
- Token balance tracking
- Transaction status
- App-specific state based on token role

### 5. Failure Mode Design
Handle Web3-specific failure scenarios:

**No Wallet**: Provide clear installation/setup guidance
**RPC Unavailable**: Graceful degradation with cached data
**Network Mismatch**: Clear network switching instructions  
**Insufficient Tokens**: Clear acquisition guidance
**Transaction Failures**: Retry mechanisms and error explanation

### 7. Performance Requirements (2025 Standards)
Set measurable performance targets aligned with 2025 Core Web Vitals:

**Core Web Vitals (Mandatory)**:
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds

**Bundle Size Targets**:
- **Initial JavaScript Bundle**: < 200KB gzipped
- **Total Page Weight**: < 1MB for initial load
- **Critical CSS**: < 50KB inline
- **Dynamic Imports**: Use for non-critical features

**Web3-Specific Performance**:
- **Wallet connection**: < 5 seconds on fast connection
- **Token balance fetch**: < 3 seconds with caching
- **Transaction confirmation**: < 30 seconds (network dependent)
- **RPC call response**: < 2 seconds with timeout handling

**Mobile Performance Targets**:
- **Mobile LCP**: < 3.5 seconds on 3G connection
- **Touch Response**: < 50ms interaction delay
- **Viewport Stability**: No layout shifts during wallet connection

**Optimization Strategies**:
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Font Optimization**: System fonts with fallbacks
- **Caching Strategy**: Aggressive caching for static assets, smart caching for RPC calls

### 8. Production Quality Requirements (2025 Standards)
Define requirements for production-ready apps, not prototypes:

**Error Boundary Strategy**:
- **React Error Boundaries**: Catch and handle component errors gracefully
- **Fallback UI**: User-friendly error pages with recovery actions
- **Error Reporting**: Log errors for debugging (client-side only, no sensitive data)
- **Graceful Degradation**: App continues working even with partial failures

**Loading States Pattern**:
- **Skeleton UI**: Content-aware loading placeholders
- **Progressive Loading**: Show partial content while loading additional data
- **Optimistic Updates**: Update UI immediately, rollback on failure
- **Loading Indicators**: Clear progress feedback for all async operations

**Environment Configuration**:
- **Environment Variables**: Separate config for development/staging/production
- **Feature Flags**: Toggle features without code deployment
- **Network Detection**: Automatically switch between mainnet/devnet
- **Secrets Management**: No hardcoded secrets, proper environment variable handling

**Security Headers (Mandatory)**:
- **Content Security Policy**: Prevent XSS attacks
- **X-Frame-Options**: Prevent clickjacking
- **HSTS**: Force HTTPS connections
- **X-Content-Type-Options**: Prevent MIME sniffing

**SEO & Discoverability**:
- **Meta Tags**: Proper Open Graph and Twitter Card metadata
- **JSON-LD**: Structured data for better search indexing
- **Sitemap**: Generate automatic sitemap for public pages
- **Robots.txt**: Proper crawling directives

**Analytics & Monitoring**:
- **Core Web Vitals Monitoring**: Track real user performance metrics
- **Error Tracking**: Client-side error monitoring (privacy-compliant)
- **User Analytics**: Privacy-first analytics with user consent
- **Performance Monitoring**: Real User Monitoring (RUM) for production insights

## SOLANA BEST PRACTICES (2025 UPDATED)

### Connection Management (Modern Patterns)
- **Use Solana Web3.js 2.0**: Leverage modern SDK features when available
- **Connection Pooling**: Efficient RPC connection management
- **Proper Cleanup**: Cleanup connections on component unmount
- **Network Switching**: Handle mainnet/devnet switching gracefully
- **RPC Fallbacks**: Multiple RPC providers with automatic failover
- **Caching Strategy**: Cache RPC responses with appropriate TTL

### Transaction Handling (Best Practices)
- **Simulation First**: Always simulate transactions before sending
- **Fee Estimation**: Implement proper transaction fee estimation
- **Priority Fees**: Support dynamic priority fees for faster confirmation
- **Retry Logic**: Handle transaction failures with exponential backoff
- **Status Tracking**: Provide clear transaction status feedback
- **Confirmation Strategy**: Wait for appropriate confirmation levels

### Security Considerations (2025 Standards)
- **Private Key Safety**: Never store or log private keys client-side
- **Transaction Validation**: Validate all transaction parameters
- **Input Sanitization**: Sanitize all user inputs before processing
- **Content Security Policy**: Implement strict CSP headers
- **Dependency Security**: Regular security audits of dependencies
- **Environment Security**: Secure handling of environment variables

## SUCCESS CRITERIA

W3 is successful when:
- [ ] Framework selection clearly justified based on app needs and 2025 best practices
- [ ] Complete wallet integration strategy defined with modern UX patterns
- [ ] All Solana interaction patterns specified with error handling
- [ ] UI component architecture follows accessibility and performance standards
- [ ] State management strategy appropriate for app complexity
- [ ] App structure supports token role from W2
- [ ] All failure modes have defined handling strategies
- [ ] Performance requirements meet 2025 Core Web Vitals standards
- [ ] Production quality requirements defined (error boundaries, loading states, security)
- [ ] Accessibility strategy ensures WCAG 2.1 AA compliance

## FAILURE CONDITIONS

STOP execution if:
- Framework selection cannot support token requirements
- Wallet integration strategy is incomplete
- Solana integration patterns are undefined
- App structure does not support token economics
- Critical failure modes lack handling strategies

Write detailed failure analysis explaining architectural limitations.

DO NOT output JSON in chat. Write all artifacts to disk only.