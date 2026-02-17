import json
import os
from collections import defaultdict

file_path = 'data/v2_data.json'
if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

feature_counts = defaultdict(int)
feature_structures = defaultdict(list)

def analyze_features(obj):
    if isinstance(obj, dict):
        if 'mechanics' in obj and 'features' in obj['mechanics']:
            for feature in obj['mechanics']['features']:
                name = feature.get('name')
                if name:
                    feature_counts[name] += 1
                    keys = sorted(feature.keys())
                    if keys not in feature_structures[name]:
                        feature_structures[name].append(keys)
        
        for k, v in obj.items():
            analyze_features(v)
    elif isinstance(obj, list):
        for item in obj:
            analyze_features(item)

analyze_features(data)

print("Feature analysis:")
for name, count in sorted(feature_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"{name}: {count} occurrences")
    for struct in feature_structures[name]:
        print(f"  Keys: {struct}")
