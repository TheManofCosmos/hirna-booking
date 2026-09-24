import os
import filecmp

def check_dir_sync(root_dir, public_dir):
    diffs = []
    for root, dirs, files in os.walk(public_dir):
        rel_dir = os.path.relpath(root, public_dir)
        target_dir = root_dir if rel_dir == '.' else os.path.join(root_dir, rel_dir)
        for f in files:
            pub_file = os.path.join(root, f)
            root_file = os.path.join(target_dir, f)
            if not os.path.exists(root_file):
                diffs.append(f"Missing in root: {os.path.relpath(root_file, root_dir)}")
            else:
                if not filecmp.cmp(pub_file, root_file, shallow=False):
                    diffs.append(f"Content mismatch: {os.path.relpath(pub_file, public_dir)}")
    return diffs

if __name__ == '__main__':
    root = os.getcwd()
    pub = os.path.join(root, 'public')
    diffs = check_dir_sync(root, pub)
    if not diffs:
        print("PERFECT: All public/ files match root files 100%!")
    else:
        print("Differences found:")
        for d in diffs:
            print(" -", d)
