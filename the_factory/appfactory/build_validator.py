#!/usr/bin/env python3
"""
Build Validator for App Factory

Validates Expo builds and generates validation reports.
"""

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union

def run_command(command: List[str], cwd: Optional[Path] = None, timeout: int = 30) -> Dict[str, Union[str, int]]:
    """Run a command and return the result."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "command": " ".join(command),
            "returncode": result.returncode,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "success": result.returncode == 0
        }
    except subprocess.TimeoutExpired:
        return {
            "command": " ".join(command),
            "returncode": -1,
            "stdout": "",
            "stderr": f"Command timed out after {timeout}s",
            "success": False
        }
    except Exception as e:
        return {
            "command": " ".join(command),
            "returncode": -1,
            "stdout": "",
            "stderr": str(e),
            "success": False
        }

def get_node_version() -> Optional[str]:
    """Get Node.js version."""
    result = run_command(["node", "--version"])
    return result["stdout"] if result["success"] else None

def get_npm_version() -> Optional[str]:
    """Get npm version."""
    result = run_command(["npm", "--version"])
    return result["stdout"] if result["success"] else None

def validate_expo_build(build_path: Path) -> Dict:
    """Validate an Expo build and generate a validation report."""
    
    validation_report = {
        "validatedAt": datetime.now().isoformat(),
        "buildPath": str(build_path),
        "nodeVersion": get_node_version(),
        "npmVersion": get_npm_version(),
        "packageManager": "npm",
        "validation": {
            "packageJsonExists": False,
            "appJsonExists": False,
            "hasValidBundleIdentifier": False,
            "hasValidAndroidPackage": False,
            "hasMandatoryFiles": False,
            "expoInstallCheck": False
        },
        "expo": {
            "version": None,
            "sdkVersion": None,
            "config": None
        },
        "dependencies": {
            "strategy": "expo-install-compatibility",
            "expoModules": [],
            "issues": []
        },
        "commands": {},
        "errors": [],
        "warnings": []
    }

    # Check if build path exists
    if not build_path.exists():
        validation_report["errors"].append(f"Build path does not exist: {build_path}")
        return validation_report

    # Check package.json
    package_json_path = build_path / "package.json"
    if package_json_path.exists():
        validation_report["validation"]["packageJsonExists"] = True
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Extract Expo modules
            dependencies = package_data.get("dependencies", {})
            expo_modules = [dep for dep in dependencies.keys() if dep.startswith("expo-")]
            validation_report["dependencies"]["expoModules"] = expo_modules
            
            # Check for hardcoded expo module versions (this is bad)
            for module in expo_modules:
                version = dependencies.get(module, "")
                if version and not version.startswith("^") and "~" in version:
                    validation_report["dependencies"]["issues"].append(
                        f"Hardcoded version for {module}: {version} (should use expo install)"
                    )
                    
        except Exception as e:
            validation_report["errors"].append(f"Could not parse package.json: {e}")
    else:
        validation_report["errors"].append("package.json not found")

    # Check app.json
    app_json_path = build_path / "app.json"
    if app_json_path.exists():
        validation_report["validation"]["appJsonExists"] = True
        try:
            with open(app_json_path, 'r') as f:
                app_data = json.load(f)
            
            expo_config = app_data.get("expo", {})
            
            # Check bundle identifiers
            ios_bundle = expo_config.get("ios", {}).get("bundleIdentifier")
            android_package = expo_config.get("android", {}).get("package")
            
            if ios_bundle:
                validation_report["validation"]["hasValidBundleIdentifier"] = True
                if not ios_bundle.startswith("com.appfactory."):
                    validation_report["warnings"].append(
                        f"Bundle identifier '{ios_bundle}' doesn't follow com.appfactory.* pattern"
                    )
            else:
                validation_report["errors"].append("Missing ios.bundleIdentifier in app.json")
                
            if android_package:
                validation_report["validation"]["hasValidAndroidPackage"] = True
                if not android_package.startswith("com.appfactory."):
                    validation_report["warnings"].append(
                        f"Android package '{android_package}' doesn't follow com.appfactory.* pattern"
                    )
            else:
                validation_report["errors"].append("Missing android.package in app.json")

        except Exception as e:
            validation_report["errors"].append(f"Could not parse app.json: {e}")
    else:
        validation_report["errors"].append("app.json not found")

    # Check mandatory files
    mandatory_files = ["App.js", "App.tsx", "app/_layout.tsx", "app/_layout.js", "app/index.tsx", "app/index.js"]
    has_entry_point = any((build_path / f).exists() for f in mandatory_files)
    validation_report["validation"]["hasMandatoryFiles"] = has_entry_point
    
    if not has_entry_point:
        validation_report["errors"].append("No valid entry point found (App.js, App.tsx, or app/_layout.tsx)")

    # Run Expo commands
    original_cwd = Path.cwd()
    try:
        os.chdir(build_path)
        
        # Check Expo version
        expo_version_result = run_command(["npx", "expo", "--version"])
        validation_report["commands"]["expo_version"] = expo_version_result
        if expo_version_result["success"]:
            validation_report["expo"]["version"] = expo_version_result["stdout"]

        # Check Expo config
        expo_config_result = run_command(["npx", "expo", "config", "--type", "public"])
        validation_report["commands"]["expo_config"] = expo_config_result
        if expo_config_result["success"]:
            try:
                config_data = json.loads(expo_config_result["stdout"])
                validation_report["expo"]["config"] = config_data
                validation_report["expo"]["sdkVersion"] = config_data.get("expo", {}).get("sdkVersion")
            except:
                validation_report["warnings"].append("Could not parse expo config JSON")

        # Check Expo install status
        expo_install_result = run_command(["npx", "expo", "install", "--check"])
        validation_report["commands"]["expo_install_check"] = expo_install_result
        validation_report["validation"]["expoInstallCheck"] = expo_install_result["success"]
        
        if not expo_install_result["success"]:
            validation_report["warnings"].append(
                "Expo install check failed - dependencies may be incompatible"
            )

        # Check Expo doctor if available
        expo_doctor_result = run_command(["npx", "expo-doctor"])
        validation_report["commands"]["expo_doctor"] = expo_doctor_result

    except Exception as e:
        validation_report["errors"].append(f"Error during command execution: {e}")
    finally:
        os.chdir(original_cwd)

    return validation_report

def write_validation_report(build_path: Path, report: Dict) -> bool:
    """Write validation report to disk."""
    try:
        # Create meta directory if it doesn't exist
        meta_dir = build_path.parent / "meta"
        meta_dir.mkdir(exist_ok=True)
        
        # Write validation report
        validation_path = meta_dir / "build_validation.json"
        with open(validation_path, 'w') as f:
            json.dump(report, f, indent=2, sort_keys=True)
        
        print(f"Validation report written to: {validation_path}")
        return True
        
    except Exception as e:
        print(f"Error writing validation report: {e}")
        return False

def generate_bundle_identifier(slug: str, max_length: int = 50) -> str:
    """Generate a deterministic bundle identifier from app slug."""
    # Convert slug to dot notation
    # Remove special characters, convert dashes to dots
    clean_slug = slug.lower()
    # Replace multiple separators with dots
    import re
    clean_slug = re.sub(r'[_\-\s]+', '.', clean_slug)
    # Remove non-alphanumeric except dots
    clean_slug = re.sub(r'[^a-z0-9.]', '', clean_slug)
    # Remove duplicate dots
    clean_slug = re.sub(r'\.+', '.', clean_slug)
    # Remove leading/trailing dots
    clean_slug = clean_slug.strip('.')
    
    # Build bundle identifier
    base = "com.appfactory"
    if clean_slug:
        bundle_id = f"{base}.{clean_slug}"
    else:
        bundle_id = f"{base}.app"
    
    # Ensure it's not too long
    if len(bundle_id) > max_length:
        # Truncate slug part
        available_length = max_length - len(base) - 1
        truncated_slug = clean_slug[:available_length]
        bundle_id = f"{base}.{truncated_slug}"
    
    return bundle_id

def main():
    """Command line interface for build validation."""
    if len(sys.argv) < 2:
        print("Usage: python -m appfactory.build_validator <command> [args...]")
        print("\nCommands:")
        print("  validate <build_path>    - Validate an Expo build")
        print("  bundle-id <slug>         - Generate bundle identifier from slug")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "validate":
        if len(sys.argv) < 3:
            print("Usage: python -m appfactory.build_validator validate <build_path>")
            sys.exit(1)
        
        build_path = Path(sys.argv[2])
        print(f"Validating build at: {build_path}")
        
        report = validate_expo_build(build_path)
        write_validation_report(build_path, report)
        
        # Print summary
        validation = report["validation"]
        errors = report["errors"]
        warnings = report["warnings"]
        
        print(f"\n📊 Validation Summary:")
        print(f"✅ Package.json exists: {validation['packageJsonExists']}")
        print(f"✅ App.json exists: {validation['appJsonExists']}")
        print(f"✅ Bundle identifier: {validation['hasValidBundleIdentifier']}")
        print(f"✅ Android package: {validation['hasValidAndroidPackage']}")
        print(f"✅ Entry point: {validation['hasMandatoryFiles']}")
        print(f"✅ Expo install check: {validation['expoInstallCheck']}")
        
        if errors:
            print(f"\n❌ Errors ({len(errors)}):")
            for error in errors:
                print(f"  - {error}")
        
        if warnings:
            print(f"\n⚠️  Warnings ({len(warnings)}):")
            for warning in warnings:
                print(f"  - {warning}")
        
        if not errors and validation["packageJsonExists"] and validation["hasValidBundleIdentifier"]:
            print(f"\n🎉 Build validation passed!")
        else:
            print(f"\n💥 Build validation failed!")
            sys.exit(1)
    
    elif command == "bundle-id":
        if len(sys.argv) < 3:
            print("Usage: python -m appfactory.build_validator bundle-id <slug>")
            sys.exit(1)
        
        slug = sys.argv[2]
        bundle_id = generate_bundle_identifier(slug)
        print(bundle_id)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()