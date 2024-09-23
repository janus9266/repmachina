def write_to_file(data: str):
    file_path = "subscription.txt"

    try:
        with open(file_path, "a") as f:
            f.write(data + "\n")
    except Exception as e:
        return

def read_from_file():
    file_path = "subscription.txt"

    try:
        with open(file_path, "r") as f:
            content = f.read()
        return content
    except Exception as e:
        return ""