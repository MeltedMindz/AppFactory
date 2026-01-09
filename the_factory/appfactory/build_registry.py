#!/usr/bin/env python3
"""
Build Registry Management for App Factory

Manages build_index.json file for tracking completed builds across all modes.
"""

import json
import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union

def get_build_registry_path() -> Path:
    """Get the path to the build registry file."""
    repo_root = Path(__file__).parent.parent
    return repo_root / "builds" / "build_index.json"

def load_build_registry() -> Dict:
    """Load the build registry, creating it if it doesn't exist."""
    registry_path = get_build_registry_path()
    
    if not registry_path.exists():
        # Create directory if it doesn't exist
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create empty registry
        empty_registry = {
            "updatedAt": datetime.now().isoformat(),
            "builds": []
        }
        with open(registry_path, 'w') as f:
            json.dump(empty_registry, f, indent=2)
        return empty_registry
    
    try:
        with open(registry_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Warning: Could not load build registry: {e}")
        return {
            "updatedAt": datetime.now().isoformat(),
            "builds": []
        }

def save_build_registry(registry: Dict) -> bool:
    """Save the build registry to disk."""
    registry_path = get_build_registry_path()
    
    try:
        # Ensure directory exists
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Update timestamp
        registry["updatedAt"] = datetime.now().isoformat()
        
        # Write to file
        with open(registry_path, 'w') as f:
            json.dump(registry, f, indent=2, sort_keys=True)
        
        return True
    except IOError as e:
        print(f"Error: Could not save build registry: {e}")
        return False

def generate_build_id(build_path: str, additional_data: Optional[str] = None) -> str:
    """Generate a deterministic build ID from build path and optional data."""
    hash_input = build_path
    if additional_data:
        hash_input += additional_data
    
    return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

def register_build(
    name: str,
    slug: str,
    mode: str,  # 'pipeline' or 'dream'
    build_path: str,
    status: str,  # 'success' or 'failed'
    run_id: Optional[str] = None,
    idea_slug: Optional[str] = None,
    dream_prompt_hash: Optional[str] = None,
    framework: str = "expo",
    launch_command: str = "npx expo start",
    notes: str = ""
) -> bool:
    """
    Register a build in the build registry.
    
    Args:
        name: Display name of the app
        slug: Safe slug identifier
        mode: 'pipeline' or 'dream'
        build_path: Relative path to the build directory
        status: 'success' or 'failed'
        run_id: ID of the source run (optional)
        idea_slug: Slug of the source idea (optional)
        dream_prompt_hash: Hash of dream prompt for dream mode (optional)
        framework: Framework used (default: expo)
        launch_command: Recommended launch command (default: npx expo start)
        notes: Additional notes about the build
    
    Returns:
        True if registration succeeded, False otherwise
    """
    
    # Load current registry
    registry = load_build_registry()
    
    # Generate build ID
    build_id = generate_build_id(build_path, dream_prompt_hash or run_id)
    
    # Check if build already exists and update if so
    existing_build = None
    for i, build in enumerate(registry["builds"]):
        if build["buildId"] == build_id:
            existing_build = i
            break
    
    # Create build entry
    build_entry = {
        "buildId": build_id,
        "name": name,
        "slug": slug,
        "origin": {
            "mode": mode,
            "runId": run_id,
            "ideaSlug": idea_slug,
            "dreamPromptHash": dream_prompt_hash
        },
        "framework": framework,
        "buildPath": build_path,
        "status": status,
        "createdAt": datetime.now().isoformat(),
        "launch": {
            "type": "expo",
            "recommended": launch_command,
            "notes": notes
        },
        "preview": {
            "enabled": status == "success",
            "instructions": [
                f"cd {build_path}",
                "npm install",
                "npx expo install --check",
                launch_command
            ]
        }
    }
    
    # Update or append build
    if existing_build is not None:
        registry["builds"][existing_build] = build_entry
        print(f"Updated existing build: {build_id}")
    else:
        registry["builds"].append(build_entry)
        print(f"Registered new build: {build_id}")
    
    # Save registry
    success = save_build_registry(registry)
    if success:
        print(f"Build registry updated successfully. Total builds: {len(registry['builds'])}")
    
    return success

def register_pipeline_build(
    name: str,
    slug: str,
    build_path: str,
    status: str,
    run_id: str,
    idea_slug: str,
    notes: str = ""
) -> bool:
    """Register a build from pipeline mode execution."""
    return register_build(
        name=name,
        slug=slug,
        mode="pipeline",
        build_path=build_path,
        status=status,
        run_id=run_id,
        idea_slug=idea_slug,
        notes=notes
    )

def register_dream_build(
    name: str,
    slug: str,
    build_path: str,
    status: str,
    run_id: str,
    dream_prompt_hash: str,
    notes: str = ""
) -> bool:
    """Register a build from dream mode execution."""
    return register_build(
        name=name,
        slug=slug,
        mode="dream",
        build_path=build_path,
        status=status,
        run_id=run_id,
        dream_prompt_hash=dream_prompt_hash,
        notes=notes
    )

def get_builds() -> List[Dict]:
    """Get all builds from the registry."""
    registry = load_build_registry()
    return registry.get("builds", [])

def get_build_by_id(build_id: str) -> Optional[Dict]:
    """Get a specific build by ID."""
    builds = get_builds()
    return next((build for build in builds if build["buildId"] == build_id), None)

def validate_build_registry() -> List[str]:
    """Validate the build registry and return any errors found."""
    errors = []
    registry_path = get_build_registry_path()
    
    if not registry_path.exists():
        errors.append(f"Build registry not found at {registry_path}")
        return errors
    
    try:
        registry = load_build_registry()
    except Exception as e:
        errors.append(f"Could not load registry: {e}")
        return errors
    
    # Validate required fields
    if "builds" not in registry:
        errors.append("Registry missing 'builds' field")
        return errors
    
    # Validate each build entry
    for i, build in enumerate(registry["builds"]):
        required_fields = ["buildId", "name", "slug", "origin", "buildPath", "status", "createdAt"]
        for field in required_fields:
            if field not in build:
                errors.append(f"Build {i}: missing required field '{field}'")
        
        # Validate origin object
        if "origin" in build:
            origin_required = ["mode"]
            for field in origin_required:
                if field not in build["origin"]:
                    errors.append(f"Build {i}: origin missing required field '{field}'")
            
            # Validate mode-specific fields
            if build["origin"].get("mode") == "dream" and not build["origin"].get("dreamPromptHash"):
                errors.append(f"Build {i}: dream mode build missing dreamPromptHash")
            elif build["origin"].get("mode") == "pipeline" and not build["origin"].get("runId"):
                errors.append(f"Build {i}: pipeline mode build missing runId")
    
    return errors

if __name__ == "__main__":
    # Command line interface for build registry management
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python -m appfactory.build_registry <command> [args...]")
        print("\nCommands:")
        print("  validate     - Validate the build registry")
        print("  list         - List all builds")
        print("  register     - Register a new build")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "validate":
        errors = validate_build_registry()
        if errors:
            print("Build registry validation errors:")
            for error in errors:
                print(f"  - {error}")
            sys.exit(1)
        else:
            print("Build registry is valid")
    
    elif command == "list":
        builds = get_builds()
        print(f"Found {len(builds)} builds:")
        for build in builds:
            print(f"  {build['buildId']}: {build['name']} ({build['status']})")
    
    elif command == "register":
        print("Use register_pipeline_build() or register_dream_build() functions from Python code")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)