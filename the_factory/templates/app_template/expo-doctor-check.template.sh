#!/bin/bash
# expo-doctor preflight check for App Factory builds
set -e

echo "🔍 Running expo-doctor preflight checks..."

# Check for expo-doctor
if ! command -v npx expo-doctor &> /dev/null; then
    echo "⚠️  expo-doctor not found, installing..."
    npm install -g @expo/doctor
fi

# Run expo-doctor and capture output
DOCTOR_OUTPUT=$(npx expo-doctor 2>&1 || true)
DOCTOR_EXIT_CODE=$?

# Write results to file
cat > expo-doctor-results.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "exitCode": $DOCTOR_EXIT_CODE,
  "output": $(echo "$DOCTOR_OUTPUT" | jq -Rs .),
  "status": $([ $DOCTOR_EXIT_CODE -eq 0 ] && echo '"passed"' || echo '"failed"'),
  "buildId": "{{BUILD_ID}}"
}
EOF

echo "📋 expo-doctor results written to expo-doctor-results.json"

if [ $DOCTOR_EXIT_CODE -ne 0 ]; then
    echo "❌ expo-doctor found issues:"
    echo "$DOCTOR_OUTPUT"
    echo ""
    echo "🛠️  Please fix these issues before proceeding with the build."
    exit 1
else
    echo "✅ expo-doctor checks passed!"
fi