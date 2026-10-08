import re

with open('pages/Product/products/index.vue', 'r') as f:
    content = f.read()

# The block to remove:
btn_pattern = r"(\s*<Button\n\s*v-if=\"checkPermission\('delete_product'\) && selectedProducts\.length > 0\"\n\s*variant=\"destructive\"\n\s*class=\"px-3 py-2 rounded-lg\"\n\s*@click=\"bulkDeleteDialog = true\"\n\s*>\n\s*<Icon icon=\"heroicons:trash\" class=\"w-4 h-4 m-1\" />\n\s*Delete \{\{ selectedProducts\.length \}\} Selected\n\s*</Button>\n)"

# Find all occurrences
parts = re.split(btn_pattern, content)

# Keep only the second match (which is inside the toolbar next to the second add product button)
# parts will have: text, match, text, match, text, match, text
# indices of matches: 1, 3, 5
new_content = ""
for i, part in enumerate(parts):
    if i in [1, 5]:
        # skip
        pass
    else:
        new_content += part

with open('pages/Product/products/index.vue', 'w') as f:
    f.write(new_content)
print("Fixed buttons")
