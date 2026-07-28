<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted } from 'vue'
import DynamicTable from '~/components/custom/DynamicTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu } from '@/composables/useMenu'
import type { ProductCategory } from '@/types/menu'
import type { Meta } from '@/types/common'
import AddCategory from '@/pages/Product/categories/add-category.vue'
import EditCategory from '@/pages/Product/categories/edit-category.vue'
import CustomAlertDialog from '~/components/custom/dialog/CustomAlertDialog.vue'

const {getAllCategories, deleteCategoryByID} = useMenu()
const { me, getMe, checkPermission } = useUsers()

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const addCategoryDialog = ref(false)
const editCategoryDialog = ref(false)
const deleteCategoryDialog = ref(false)
const categoryInfo = ref<ProductCategory>({} as ProductCategory)


const { toast } = useToast()
onMounted(async () => {
    //get all menu products from server
    await getMe()

    try {
        const response = await loadData()
    } catch (error: any) {
        console.error('Error fetching menu products:', error)
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }

})

watch(addCategoryDialog, async (newVal) => {
    console.log("addCategoryDialog watch-----> ", newVal)
    if (!newVal){
        await loadData()
    }
})

watch(meta, async (newVal) => {
    console.log("meta watch-----> ", newVal)
    await loadData()
})

const loadData = async () => {
    try {
        const categories: any = await getAllCategories(me.value?.business_id ?? '', meta.value.page, meta.value.page_size)
        data.value = categories.data
        meta.value.page = categories.meta.page
        meta.value.page_size = categories.meta.page_size
        meta.value.total = categories.meta.total
        meta.value.total_pages = categories.meta.total_pages
    } catch (error: any) {
        console.error('Error fetching menu products:', error)
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }
}

const handleAddCategory = async () => {
    addCategoryDialog.value = !addCategoryDialog.value
}

const handleEditCategory = async (category: ProductCategory) => {
    categoryInfo.value = category
    editCategoryDialog.value = !editCategoryDialog.value
}

const toggleDeleteCategoryDialog = (category: ProductCategory) => {
    categoryInfo.value = category
    deleteCategoryDialog.value = !deleteCategoryDialog.value
    console.log("deleteCategoryDialog -----> ", deleteCategoryDialog.value)
}

const handleDeleteCategory = async () => {
    try {
        const response = await deleteCategoryByID(categoryInfo.value)
        toast({
            title: 'Category Deleted',
            description: 'Category deleted successfully',
            variant: 'success'
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Failed to delete category',
            variant: 'destructive'
        })
    }
}

const handleViewAll = () => {
    console.log('View all clicked')
}

const handleToggleFilters = () => {
    console.log('Toggle filters clicked')
}

const handlePageChange = async (newPage:number) => {
    meta.value.page = newPage
    console.log("Current Page -----> ", meta.value.page)
    console.log("Page Size -----> ", meta.value.page_size)
    await loadData()
}

const handlePageSizeChange = async (newPageSize:number) => {
    meta.value.page_size = newPageSize
    meta.value.page = 1
    await loadData()
}

const columns: ColumnDef<ProductCategory, any>[] = [
    {
        header: 'Category Name',
        accessorKey: 'name',
    },
    {
        header: 'External ID (POS)',
        accessorKey: 'external_id',
    },
    {
        header: 'Description',
        accessorKey: 'description',
    },
    {
        header: 'Image',
        accessorKey: 'image_url',
        cell: ({row}) => {
            if (!row.original.image_url) return null
            return h('img', {
                src: row.original.image_url,
                class: 'w-10 h-10 object-contain rounded-lg'
            })
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({row}) => {
            const IconComponent = resolveComponent('Icon')

            return h('div', {
                class: 'flex items-center gap-2'
            }, [
                checkPermission('create_product') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditCategory(row.original as ProductCategory),
                }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
                checkPermission('delete_product') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => toggleDeleteCategoryDialog(row.original as ProductCategory),
                }, () => h(Icon, { icon: 'heroicons:trash' }))
            ])
        }
    },
    /* {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({row}) => {
            const IconComponent = resolveComponent('Icon')

            return h('div', {
                class: 'flex items-center gap-2'
            }, [
                h(IconComponent, {  // Use the imported component reference, not a string
                    name: 'ph:pencil',
                    class: 'w-5 h-5',
                    onClick: () => handleEditCategory(row.original as ProductCategory)
                }),
                h(IconComponent, {  // Use the imported component reference, not a string
                    name: 'ph:trash',
                    class: 'w-5 h-5',
                    onClick: () => toggleDeleteCategoryDialog(row.original as ProductCategory)
                })
            ])
        }
    }, */
]

const data = ref<ProductCategory[]>([
    
])

</script>

<style scoped></style>

<template>
   
    <div class="w-full h-full p-6">
        <Breadcrumb class="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        Categories
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <!-- Header title of page -->
        <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Icon icon="heroicons:flag" class="w-6 h-6" />
                </div>
                <span class="flex flex-col">
                    <h1 class="text-2xl font-bold">Categories</h1>
                    <span class="text-sm text-gray-500">View your categories and the business they represent. Easily track and manage the list for seamless organization.</span>
                </span>
            </div>
        </div>
        <!-- Content of page -->
        <div class="flex flex-col justify-start items-start">
            <!-- <CustomEnhancedDataTable    
                class="h-[500px] w-full"
                :totalRecords="data.length"
                :columns="columns"
                :data="data"
                searchKey="name"
                :enableSelection="false"
                @viewAll="handleViewAll"
                @toggleFilters="handleToggleFilters"
                :currentPage="currentPage"
                :pageSize="pageSize"
                @pageChange="handlePageChange"
                @pageSizeChange="handlePageSizeChange"
            /> -->
            <DynamicTable 
                class="w-full"
                :columns="columns" 
                :data="data" 
                searchKey="name"
                :enableSelection="true"
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                :pageSize="meta.page_size"
                @viewAll="handleViewAll"
                @toggleFilters="handleToggleFilters"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disable-filter="true"
            >
                <template #toolbar-buttons>
                    <Button v-if="checkPermission('create_product')" class="btn-primary px-3 py-2 rounded-lg" @click="handleAddCategory">
                        <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                        Add Category
                    </Button>
                </template>
            </DynamicTable>
        </div>
        
        <!-- Add Category Dialog -->
        <AddCategory v-model="addCategoryDialog" />

        <!-- Edit Category Dialog -->
        <EditCategory 
            v-if="editCategoryDialog"
            v-model="editCategoryDialog" 
            :category="categoryInfo as ProductCategory" 
            @success="loadData"
        />

        <!-- Delete Category Dialog -->
        <CustomAlertDialog
            v-if="deleteCategoryDialog"
            v-model="deleteCategoryDialog"
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            :openDialog="deleteCategoryDialog"
            :onOpenChange="() => deleteCategoryDialog = false"
            :onConfirm="async () => {
                await handleDeleteCategory()
                deleteCategoryDialog = false
                await loadData()
            }"
        />
        
    </div>
</template>