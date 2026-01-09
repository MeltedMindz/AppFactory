# Vendor Documentation Cache System

## Overview

The App Factory maintains cached copies of official LLM-facing documentation from key vendors to ensure deterministic, reliable, and fast access to authoritative technical information during pipeline execution.

## Purpose

### Why Vendor Docs Exist
- **Deterministic Builds**: Eliminates dependency on web search availability and consistency
- **Performance**: Faster access to documentation than real-time web fetching
- **Quality**: Ensures pipeline stages use official vendor documentation as primary source
- **Reliability**: Reduces build failures due to network issues or rate limiting

### Vendor Docs vs Web Search
- **Primary Source**: Vendor docs are consulted first for all technical decisions
- **Fallback Only**: Web search is used only when cached docs are insufficient
- **Official Sources**: When web search is needed, restrict to official vendor domains

## Cached Documentation

### Expo Documentation
- **Source**: https://docs.expo.dev/llms.txt
- **Location**: `the_factory/vendor/expo-docs/llms.txt`
- **Metadata**: `the_factory/vendor/expo-docs/meta.json`
- **Content**: Expo Router, SDK features, React Native integration, configuration guides
- **Usage**: Navigation patterns, app configuration, platform-specific features

### RevenueCat Documentation  
- **Source**: https://www.revenuecat.com/docs/llms.txt
- **Location**: `the_factory/vendor/revenuecat-docs/llms.txt`
- **Metadata**: `the_factory/vendor/revenuecat-docs/meta.json`
- **Content**: Subscription implementation, entitlements, purchase flows, testing
- **Usage**: Monetization implementation, subscription management, purchase restoration

## Refreshing Documentation

### Manual Refresh Commands
```bash
# Refresh all vendor documentation
node scripts/cache_vendor_llms_docs.mjs

# Refresh individual vendors
node scripts/cache_expo_llms_docs.mjs
node scripts/cache_revenuecat_llms_docs.mjs
```

### When to Refresh
- **Weekly**: Regular maintenance to stay current with vendor updates
- **Before Major Builds**: When starting significant development cycles
- **SDK Upgrades**: After upgrading Expo SDK or major dependency versions  
- **Build Failures**: If builds fail due to outdated documentation patterns

### Refresh Verification
After refreshing, verify:
- Files exist and are non-empty
- SHA256 hashes changed (indicating updated content)
- Metadata timestamps are recent
- No download or parsing errors in logs

## Stage Integration

### Stages That Use Vendor Docs

**Stage 04 (Monetization)**:
- **Primary**: `vendor/revenuecat-docs/llms.txt`
- **Usage**: Subscription pricing, entitlements design, purchase flow patterns
- **Fallback**: revenuecat.com if cached docs insufficient

**Stage 10 (App Builder)**:
- **Primary**: `vendor/expo-docs/llms.txt` AND `vendor/revenuecat-docs/llms.txt`
- **Usage**: Navigation architecture, app configuration, subscription implementation
- **Fallback**: docs.expo.dev and revenuecat.com if cached docs insufficient

### Integration Pattern
All affected stage prompts include a "VENDOR DOCS FIRST" section:

1. **Consult Cached Docs**: Read relevant vendor/*/llms.txt files
2. **Extract Patterns**: Use official patterns for technical decisions
3. **Document Usage**: Citation in research.md files
4. **Web Search (if needed)**: Only official vendor domains
5. **Never Skip**: Vendor docs consultation is mandatory, not optional

## File Structure

### Directory Layout
```
the_factory/vendor/
├── expo-docs/
│   ├── llms.txt           # Cached documentation content
│   └── meta.json          # Download metadata (SHA256, timestamp, etc.)
└── revenuecat-docs/
    ├── llms.txt           # Cached documentation content
    └── meta.json          # Download metadata (SHA256, timestamp, etc.)
```

### Metadata Schema
```json
{
  "sourceUrl": "https://docs.expo.dev/llms.txt",
  "downloadedAt": "2026-01-09T02:47:30.157Z",
  "bytes": 90533,
  "sha256": "96301b1f4abf6f52026790b153c9f4e6126591d7711cdc0ce43c31c17b779872",
  "nodeVersion": "v24.2.0"
}
```

## Version Control

### What Gets Committed
- ✅ `vendor/*/llms.txt` - Cached documentation content
- ✅ `vendor/*/meta.json` - Download metadata
- ✅ `scripts/cache_*.mjs` - Caching scripts

### What Gets Ignored
- ❌ `vendor/**/llms.txt.tmp.*` - Temporary download files
- ❌ `vendor/**/bundles/` - Additional bundle directories (if any)

### Git Strategy
- **Commit Updates**: When refreshing docs, commit the updated files
- **Diff Friendly**: Text files show meaningful diffs for doc changes
- **Size Reasonable**: LLM docs are optimized text, typically 10-100KB each

## Troubleshooting

### Common Issues

**Download Failures**:
- Check network connectivity
- Verify vendor URLs are accessible
- Check for rate limiting or blocking

**Stale Documentation**:
- Compare SHA256 hashes with previous versions
- Check vendor websites for recent updates
- Refresh more frequently if vendor updates rapidly

**Stage Integration Issues**:
- Verify stage prompts reference correct file paths
- Check that "VENDOR DOCS FIRST" sections are present
- Ensure stages fail if vendor docs are missing or unreadable

**File Permission Issues**:
- Ensure script has write permissions to vendor/ directory
- Check that atomic write operations complete successfully
- Verify temp file cleanup works correctly

### Recovery Procedures

**Corrupted Cache**:
```bash
# Remove corrupted files
rm -rf vendor/*/llms.txt vendor/*/meta.json

# Re-download fresh copies  
node scripts/cache_vendor_llms_docs.mjs
```

**Missing Vendor Docs During Stage Execution**:
1. Stage should fail loudly if vendor docs missing
2. Run cache scripts to download missing docs
3. Re-run stage execution
4. Do not continue with web search fallback if vendor docs completely missing

## Quality Assurance

### Validation Checklist
- [ ] All vendor docs download without errors
- [ ] SHA256 hashes are calculated and stored
- [ ] File sizes are reasonable (not empty, not suspiciously large)
- [ ] Metadata includes all required fields
- [ ] Stage prompts reference vendor docs correctly
- [ ] Stages fail appropriately when vendor docs missing

### Performance Monitoring  
- Track download times and success rates
- Monitor file sizes for significant changes
- Watch for vendor URL changes or access issues
- Validate that stages actually use cached docs vs web search