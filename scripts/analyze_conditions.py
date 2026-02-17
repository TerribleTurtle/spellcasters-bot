import json
import os

file_path = 'data/v2_data.json'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

conditions = set()

def find_conditions(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == 'condition' and isinstance(v, str):
                conditions.add(v)
            else:
                find_conditions(v)
    elif isinstance(obj, list):
        for item in obj:
            find_conditions(item)

find_conditions(data)
print("Unique conditions:")
for c in sorted(conditions):
    print(c)
