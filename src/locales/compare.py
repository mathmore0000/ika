import json

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def compare_dicts(dict1, dict2, path=""):
    differences = []
    for key in dict1:
        current_path = f"{path}.{key}" if path else key  # Atualiza o caminho para o nível atual
        if key not in dict2:
            differences.append(f"{current_path} missing in second file")
        if isinstance(dict1[key], dict) and isinstance(dict2[key], dict):
            # Recursivamente compara dicionários aninhados
            differences.extend(compare_dicts(dict1[key], dict2[key], current_path))

    for key in dict2:
        current_path = f"{path}.{key}" if path else key
        if key not in dict1:
            differences.append(f"{current_path} missing in first file")

    return differences


    return differences

def main(file1_path, file2_path):
    json1 = load_json(file1_path)
    json2 = load_json(file2_path)

    differences = compare_dicts(json1, json2, path="root")

    if differences:
        print("Differences found:")
        for diff in differences:
            print(diff)
    else:
        print("No differences found. Files are identical.")

# Run the comparison with your file paths
main('./es.json', './en.json')
