# Stage 04: Monetization Strategy

## AGENT-NATIVE EXECUTION
You are Claude executing Stage 04 for a SPECIFIC IDEA PACK. Design comprehensive monetization strategy based on current market pricing and RevenueCat best practices.

## BUILD MODE VERIFICATION (CRITICAL)
Stage 04 can ONLY be executed via `build <IDEA_ID_OR_NAME>` command:
- Verify invocation came from build mode, not `run app factory`
- Require Stage 01-03 artifacts exist (hard-fail if missing)
- Assert this stage is building ONE SPECIFIC IDEA only
- Hard-fail if executed during batch idea generation

## STANDARDS CONTRACT (MANDATORY)
Read and comply with `standards/mobile_app_best_practices_2026.md`. Your output must include a "Standards Compliance Mapping" section demonstrating subscription transparency and RevenueCat implementation requirements.

## INPUTS
- Read: `runs/.../ideas/<idea_dir>/stages/stage03.json` (UX design specification)
- Read: `runs/.../ideas/<idea_dir>/stages/stage02.json` (product specification)
- Read: `runs/.../ideas/<idea_dir>/meta/idea.json` (canonical idea definition)
- Read: `runs/.../ideas/<idea_dir>/meta/boundary.json` (isolation enforcement)

## OUTPUTS
- Write: `runs/.../ideas/<idea_dir>/stages/stage04.json` (validated monetization strategy)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage04_execution.md` (execution log with decisions)
- Write: `runs/.../ideas/<idea_dir>/outputs/stage04_research.md` (pricing research citations)
- Render: `runs/.../ideas/<idea_dir>/spec/04_monetization.md` (specification markdown)
- Update: `runs/.../ideas/<idea_dir>/meta/stage_status.json` (progress tracking)

## VENDOR DOCS FIRST (MANDATORY)
Use vendor/ cached llms.txt as the primary source before any web searching.

### Required Research Sources (IN ORDER)
**Primary Sources** (Use FIRST):
1. **RevenueCat Documentation**: Read `the_factory/vendor/revenuecat-docs/llms.txt`
   - Use cached docs to understand entitlements, offerings, and implementation patterns
   - Reference subscription best practices, pricing strategies, and mobile monetization
   - Only web search revenuecat.com if cached docs are insufficient
   
**Secondary Sources** (After vendor docs):
- **Category Pricing**: Survey 5-7 apps in same category for current pricing norms
- **App Store/Play Store**: Browse subscription apps to understand trial structures
- **Platform Policies**: Current App Store and Google Play subscription requirements

Do not perform exploratory web searches until vendor docs are consulted.
If web search is required, restrict to official domains (revenuecat.com for subscription guidance).

### Research Focus Areas
1. **Pricing Benchmarks**: What users currently pay for similar app categories
2. **Trial Strategies**: Current trial length and conversion optimization practices
3. **Subscription Tiers**: How successful apps structure monthly vs annual pricing
4. **Premium Features**: What features justify subscription vs one-time purchase
5. **Conversion Funnels**: How apps move users from free to paid effectively

### Citation Requirements
Document research in `stage04_research.md`:
- Competitive pricing analysis with specific examples
- Trial strategy research and conversion data
- RevenueCat implementation best practices
- Platform policy compliance requirements

## BOUNDARY ENFORCEMENT
This stage must ONLY read from:
- Current idea pack: `runs/.../ideas/<idea_dir>/`
- Global standards: `standards/mobile_app_best_practices_2026.md`

## JSON SCHEMA

```json
{
  "meta": {
    "run_id": "string",
    "idea_id": "string",
    "idea_name": "string", 
    "idea_dir": "string",
    "source_root": "string",
    "input_stage_paths": ["array of files read"],
    "boundary_path": "string"
  },
  "monetization_strategy": {
    "business_model": {
      "model_type": "Freemium Subscription",
      "rationale": "string",
      "free_tier": {
        "features": ["string"],
        "limitations": ["string"],
        "purpose": "string"
      }
    },
    "pricing_strategy": {
      "monthly_subscription": {
        "price": "string",
        "positioning": "string",
        "target_market": "string"
      },
      "annual_subscription": {
        "price": "string", 
        "discount_percentage": "string",
        "positioning": "string"
      },
      "trial_strategy": {
        "duration": "string",
        "trial_type": "full_access|limited_features",
        "conversion_tactics": ["string"]
      }
    },
    "revenuecat_integration": {
      "products": [
        {
          "product_id": "string",
          "type": "auto_renewable_subscription",
          "price": "string",
          "duration": "string",
          "grace_period": "string"
        }
      ],
      "entitlements": [
        {
          "identifier": "string",
          "products": ["string"]
        }
      ],
      "paywall_configuration": {
        "trigger_events": ["string"],
        "presentation_style": "string", 
        "dismissal_rules": ["string"]
      },
      "sdk_configuration": {
        "initialization_location": "string",
        "api_key_source": "environment variables",
        "logging_level": "string",
        "entitlement_identifier": "string"
      },
      "restore_flow": {
        "restore_button_placement": ["string"],
        "restore_method": "restorePurchases",
        "error_handling": ["string"]
      }
    },
    "conversion_optimization": {
      "value_demonstration": {
        "onboarding_hooks": ["string"],
        "progressive_feature_unlock": ["string"],
        "social_proof_elements": ["string"]
      },
      "retention_strategy": {
        "engagement_features": ["string"],
        "churn_prevention": ["string"],
        "winback_campaigns": ["string"]
      }
    },
    "revenue_projections": {
      "target_metrics": {
        "monthly_active_users": "string",
        "trial_conversion_rate": "string", 
        "monthly_churn_rate": "string",
        "projected_mrr_year_1": "string"
      },
      "pricing_experiments": [
        {
          "hypothesis": "string",
          "test_description": "string",
          "success_criteria": "string"
        }
      ]
    }
  }
}
```

## EXECUTION STEPS

### Phase 1: Market Research & Analysis
1. Read product and UX specifications to understand value proposition
2. Research current pricing in app category for benchmarking
3. Analyze subscription models and trial strategies of successful apps
4. Review RevenueCat documentation for implementation requirements

### Phase 2: Pricing Strategy Design
5. Design freemium model balancing free value with upgrade incentive
6. Set pricing based on market research and value proposition strength
7. Structure annual discount to maximize lifetime value
8. Design trial strategy optimizing for conversion without devaluing product

### Phase 3: RevenueCat Implementation Planning
9. Define subscription products with appropriate grace periods
10. Design entitlement system for feature gating
11. Plan paywall triggers and presentation strategy
12. Specify subscription management and restoration flows

## RevenueCat Integration — Hard Gate (MANDATORY)

A build is NOT complete unless ALL are true:

### 1) SDK Installed + Configured
- Correct RevenueCat SDK installed per Expo/React Native docs (react-native-purchases + react-native-purchases-ui)
- Initialization occurs once at app startup with platform keys from env (EXPO_PUBLIC_REVENUECAT_IOS_API_KEY, EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY)
- Logging level set appropriately for dev vs prod per debugging docs
- If keys are missing, include integration with placeholders and clear DEV warning

### 2) Entitlement Model
- Define a single entitlement identifier (e.g. 'pro') used consistently
- Access checks rely on CustomerInfo entitlements active status
- All premium features gated behind entitlement verification

### 3) Offerings + Paywall + Restore
- Paywall screen exists and is reachable from onboarding and settings
- Offerings are fetched and packages displayed per displaying-products docs
- Purchase flow implemented per making-purchases docs
- Restore purchases implemented per restoring-purchases docs with user-initiated restore button
- Empty offerings state handled with clear message + link to troubleshooting guidance

### 4) Feature Gating
- At least one core premium feature is gated behind entitlement
- Free tier experience remains coherent (guest-first)
- UI reflects subscription status clearly

### 5) No Silent Skips
- Missing keys must NOT cause integration to be omitted
- If keys are missing, include integration with placeholders and clear DEV warning
- Stage must not claim success if paywall/gating is absent

### 6) Build Verification
- Include minimal debug confirmation:
  - Offerings loaded (or empty with reason)
  - Entitlement state resolved
  - Purchases/restore errors surfaced with actionable messages

### Phase 4: Conversion & Retention Strategy
13. Design progressive value demonstration during trial period
14. Plan retention features that build habit and dependency
15. Create churn prevention and winback campaign strategy
16. Set success metrics and experimentation framework

### Phase 5: Validation & Documentation
17. Validate pricing against market research and value proposition
18. Ensure compliance with platform subscription requirements
19. Write JSON with complete monetization strategy
20. Document research influence on pricing decisions
21. Render human-readable monetization specification

## STANDARDS COMPLIANCE MAPPING

### Subscription & Store Compliance (MANDATORY)
- **Requirement**: RevenueCat integration for all subscription handling
- **Implementation**: All products defined in RevenueCat with entitlement-based access control
- **Validation**: No custom billing logic, proper subscription lifecycle handling

### Pricing Transparency
- **Requirement**: Clear pricing disclosure and auto-renewal terms
- **Implementation**: Honest paywall design with visible pricing and cancellation terms
- **Validation**: No dark patterns, clear premium value communication

### Platform Requirements
- **Requirement**: Restore purchases, subscription management, platform compliance
- **Implementation**: One-tap restore, in-app subscription management links
- **Validation**: Follows App Store and Google Play subscription guidelines

### User Experience Standards
- **Requirement**: Freemium model allows dismissible paywall
- **Implementation**: Core free features accessible, paywall dismissible with clear close button
- **Validation**: No forced subscription loops or hidden premium barriers

## SUCCESS CRITERIA
Stage 04 is complete when:
- [ ] `stage04.json` exists and validates against schema
- [ ] `stage04_research.md` documents competitive pricing analysis
- [ ] RevenueCat integration properly planned with products and entitlements
- [ ] Pricing strategy based on current market research
- [ ] Freemium model balances free value with conversion incentives
- [ ] Subscription model complies with platform transparency requirements

## HARD FAILURE CONDITIONS
- Schema validation failure → Write `stage04_failure.md` and stop
- Missing competitive pricing research → Write `stage04_failure.md` and stop
- RevenueCat integration not properly specified → Write `stage04_failure.md` and stop
- Pricing model violates platform requirements → Write `stage04_failure.md` and stop
- Boundary violation (reading from wrong idea pack) → Write `stage04_failure.md` and stop

DO NOT output JSON in chat. Write all artifacts to disk and continue with Stage 05.