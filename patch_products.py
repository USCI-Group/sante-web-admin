import re
import sys

with open('pages/Product/products/index.vue', 'r') as f:
    content = f.read()

# 1. Add Imports
imports = """
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
"""
content = re.sub(r"(import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs')", r"\1\n" + imports, content)

# 2. Add getAllCategories
content = re.sub(r"const {getAllMenuProducts, deleteProductByID, getModifierList, syncMenuToGrab, syncMenuToShopeeForAllOutlets} = useMenu\(\)",
                 "const {getAllMenuProducts, deleteProductByID, getModifierList, syncMenuToGrab, syncMenuToShopeeForAllOutlets, getAllCategories} = useMenu()",
                 content)

# 3. Add variables
vars_str = """
const selectedCategory = ref('')
const selectedStatus = ref('')
const categoriesList = ref<any[]>([])
const selectedProducts = ref<Menu[]>([])
const bulkDeleteDialog = ref(false)
const tableRef = ref<any>(null)
"""
content = re.sub(r"const activeTab = ref\('products'\)", "const activeTab = ref('products')\n" + vars_str, content)

# 4. Add onMounted fetch
onmounted_str = """
    if (me.value?.business_id) {
        try {
            const catResponse = await getAllCategories(me.value.business_id, 1, 1000)
            categoriesList.value = catResponse.data ?? []
        } catch(e) {
            console.error(e)
        }
    }
"""
content = re.sub(r"document\.addEventListener\('click', handleClickOutside\)", "document.addEventListener('click', handleClickOutside)\n" + onmounted_str, content)

# 5. Modify loadData
load_data_str = """
        if (selectedCategory.value) {
            body.category_id = selectedCategory.value
        }
        if (selectedStatus.value) {
            body.status = selectedStatus.value
        }
"""
content = re.sub(r"if \(searchQuery\.value\) \{\n\s*body\.search = searchQuery\.value\n\s*\}", "if (searchQuery.value) {\n            body.search = searchQuery.value\n        }\n" + load_data_str, content)

# 6. Add watchers
watchers_str = """
watch([searchQuery, selectedCategory, selectedStatus], async () => {
    currentPage.value = 1
    await loadData()
})
"""
content = re.sub(r"watch\(searchQuery, async \(newVal\) => \{\n\s*currentPage\.value = 1\n\s*await loadData\(\)\n\}, \{ deep: true \}\)", watchers_str, content)

# 7. Add bulk delete methods
methods_str = """
const handleSelectionChange = (rows: Menu[]) => {
    selectedProducts.value = rows
}

const handleBulkDelete = async () => {
    const results = await Promise.allSettled(
        selectedProducts.value.map((product) => deleteProductByID(product, me.value?.business_id as string))
    )
    const failed = results.filter((r) => r.status === 'rejected').length

    if (failed) {
        toast({
            title: 'Partially Deleted',
            description: `${results.length - failed} of ${results.length} products deleted. ${failed} failed.`,
            variant: 'destructive'
        })
    } else {
        toast({
            title: 'Products Deleted',
            description: `Successfully deleted ${results.length} products.`,
        })
    }

    selectedProducts.value = []
    if (tableRef.value) {
        tableRef.value.clearSelection()
    }
    bulkDeleteDialog.value = false
    await loadData()
}
"""
content = re.sub(r"const handleCreateModifier = \(\) => \{", methods_str + "\n\nconst handleCreateModifier = () => {", content)

# 8. UI - Add filters
ui_filters = """
                    <!-- Filters -->
                    <div class="flex items-center gap-2 ml-4">
                        <Select v-model="selectedCategory">
                            <SelectTrigger class="w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                <SelectItem v-for="cat in categoriesList" :key="cat.id" :value="cat.id">
                                    {{ cat.name }}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select v-model="selectedStatus">
                            <SelectTrigger class="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
"""
content = re.sub(r"<!-- Toolbar Buttons -->", ui_filters + "\n                    <!-- Toolbar Buttons -->", content)

# 9. UI - Add bulk delete button
bulk_del_btn = """
                            <Button
                                v-if="checkPermission('delete_product') && selectedProducts.length > 0"
                                variant="destructive"
                                class="px-3 py-2 rounded-lg"
                                @click="bulkDeleteDialog = true"
                            >
                                <Icon icon="heroicons:trash" class="w-4 h-4 m-1" />
                                Delete {{ selectedProducts.length }} Selected
                            </Button>
"""
content = re.sub(r"(<Button v-if=\"checkPermission\('create_product'\)\")", bulk_del_btn + r"\n                            \1", content)

# 10. Link table events
content = re.sub(r"<CustomDynamicTable", '<CustomDynamicTable ref="tableRef" @selectionChange="handleSelectionChange"', content)

# 11. Add Bulk Delete Dialog
bulk_dialog = """
        <CustomAlertDialog 
            v-if="bulkDeleteDialog"
            v-model="bulkDeleteDialog"
            title="Delete Products"
            :description="`Are you sure you want to delete ${selectedProducts.length} products? This cannot be undone.`"
            :openDialog="bulkDeleteDialog"
            :onOpenChange="() => bulkDeleteDialog = false"
            :onConfirm="handleBulkDelete"
        />
"""
content = re.sub(r"<!-- Delete Product Dialog -->", bulk_dialog + "\n        <!-- Delete Product Dialog -->", content)

with open('pages/Product/products/index.vue', 'w') as f:
    f.write(content)

print("Patched index.vue")
