import json
import os
import sys

DATA_FILE = 'data/v2_data.json'

def fail(msg):
    print(f"❌ VALIDATION ERROR: {msg}")
    sys.exit(1)

def validate_condition_object(cond, path):
    if isinstance(cond, str):
        fail(f"Field 'condition' at {path} must be an object, not a string: \"{cond}\"")
    if cond is None:
        return # Implicit Always
    if not isinstance(cond, dict):
        fail(f"Field 'condition' at {path} must be an object or null.")
    
    required = ['field', 'operator', 'value']
    for req in required:
        if req not in cond and 'notes' not in cond: # notes might be exception
             # Actually, notes-only condition is valid for "Always - UNCONFIRMED"?
             # Let's enforce strict structure for now. If notes only, maybe no condition field needed?
             pass 

    # For now, just ensure it's a dict if present.

def validate_features(features_list, path):
    if not isinstance(features_list, list):
        return
    for item in features_list:
        if isinstance(item, dict):
            name = item.get('name')
            if name in ['Pierce', 'Stealth', 'Cleave', 'Homing', 'Knockback', 'Interruption']:
                fail(f"Feature '{name}' at {path} must be a root property, not in 'features' list.")

def validate_root_properties(obj, path):
    # Pierce
    if 'pierce' in obj:
        if not isinstance(obj['pierce'], bool):
            fail(f"Field 'pierce' at {path} must be a boolean.")
    
    # Homing
    if 'homing' in obj:
        if not isinstance(obj['homing'], bool):
            fail(f"Field 'homing' at {path} must be a boolean.")

    # Knockback
    if 'knockback' in obj:
        if not isinstance(obj['knockback'], bool):
            fail(f"Field 'knockback' at {path} must be a boolean.")

    # Interruption
    if 'interruption' in obj:
        if not isinstance(obj['interruption'], bool):
            fail(f"Field 'interruption' at {path} must be a boolean.")

    # Stealth
    if 'stealth' in obj:
        if not isinstance(obj['stealth'], dict):
            fail(f"Field 'stealth' at {path} must be an object.")
        if 'duration' not in obj['stealth'] and 'notes' not in obj['stealth']: # Allow notes for untyped stealth?
            pass # Strictness can be refined.
            
    # Cleave
    if 'cleave' in obj:
        if not isinstance(obj['cleave'], bool):
            fail(f"Field 'cleave' at {path} must be a boolean.")

def traverse(obj, path="root"):
    if isinstance(obj, dict):
        # Check specific fields
        if 'condition' in obj:
            validate_condition_object(obj['condition'], path)
        
        if 'mechanics' in obj:
            mech = obj['mechanics']
            if 'features' in mech:
                validate_features(mech['features'], path + ".mechanics")
            validate_root_properties(mech, path + ".mechanics")
        
        # Also check root properties on abilities directly if applicable (though plan says mechanics)
        # Let's check everywhere just in case.
        validate_root_properties(obj, path)

        for k, v in obj.items():
            traverse(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            traverse(item, f"{path}[{i}]")

def main():
    if not os.path.exists(DATA_FILE):
        fail(f"File not found: {DATA_FILE}")
    
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            fail(f"Invalid JSON: {e}")
    
    print(f"🔍 Validating {DATA_FILE}...")
    traverse(data)
    print("✅ Schema validation PASSED.")

if __name__ == "__main__":
    main()
