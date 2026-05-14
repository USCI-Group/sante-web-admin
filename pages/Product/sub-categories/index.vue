<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted } from 'vue'
import DynamicTable from '~/components/custom/DynamicTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu } from '@/composables/useMenu'
import type { ProductSubCategory } from '@/types/menu'
import type { Meta } from '@/types/common'
import AddSubCategory from '@/pages/Product/sub-categories/add-sub-category.vue'
import EditSubCategory from '@/pages/Product/sub-categories/edit-sub-category.vue'
import CustomAlertDialog from '~/components/custom/dialog/CustomAlertDialog.vue'

const {getAllSubCategories, deleteSubCategoryByID} = useMenu()
const { myProfile, checkPermission } = useMyProfileStore()

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const addSubCategoryDialog = ref(false)
const editSubCategoryDialog = ref(false)
const deleteSubCategoryDialog = ref(false)
const subCategoryInfo = ref<ProductSubCategory>({} as ProductSubCategory)
const subCategoryToDelete = ref<ProductSubCategory>({} as ProductSubCategory)

const { toast } = useToast()
onMounted(async () => {
    //get all menu products from server
    try {
        const response = await loadData()
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }

})

watch(addSubCategoryDialog, async (newVal) => {
    if (!newVal){
        await loadData()
    }
})

watch(meta, async (newVal) => {
    await loadData()
})

const loadData = async () => {
    try {
        const subCategories: any = await getAllSubCategories(myProfile?.business_id as string, meta.value.page, meta.value.page_size)
        data.value = subCategories.data
        meta.value.page = subCategories.meta.page
        meta.value.page_size = subCategories.meta.page_size
        meta.value.total = subCategories.meta.total
        meta.value.total_pages = subCategories.meta.total_pages
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }
}

const handleAddSubCategory = async () => {
    addSubCategoryDialog.value = !addSubCategoryDialog.value
    console.log("addSubCategoryDialog -----> ", addSubCategoryDialog.value)
   
}

const handleEditSubCategory = (subCategory: ProductSubCategory) => {
    console.log(subCategory)
    subCategoryInfo.value = subCategory
    editSubCategoryDialog.value = !editSubCategoryDialog.value
    console.log("editSubCategoryDialog -----> ", editSubCategoryDialog.value)
}

const toggleDeleteSubCategoryDialog = (subCategory: ProductSubCategory) => {
    subCategoryToDelete.value = subCategory
    deleteSubCategoryDialog.value = !deleteSubCategoryDialog.value
}

const handleDeleteSubCategory = async () => {
    try {
        const response = await deleteSubCategoryByID(subCategoryToDelete.value)
        toast({
            title: 'Sub Category Deleted',
            description: 'Sub Category deleted successfully',
            variant: 'success'
        })      
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Failed to delete sub category',
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
    await loadData()
}

const handlePageSizeChange = async (newPageSize:number) => {
    meta.value.page_size = newPageSize
    meta.value.page = 1
    await loadData()
}

const columns: ColumnDef<ProductSubCategory, any>[] = [
    {
        header: 'Sub Category Name',
        accessorKey: 'name',
    },
    {
        header: 'Description',
        accessorKey: 'description',
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
                    onClick: () => handleEditSubCategory(row.original as ProductSubCategory),
                }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
                checkPermission('delete_product') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => toggleDeleteSubCategoryDialog(row.original as ProductSubCategory),
                }, () => h(Icon, { icon: 'heroicons:trash' }))
            ])
        }
    },
    /* {
        header: ' ',
        accessorKey: 'actions',
        cell: ({row}) => {
            const IconComponent = resolveComponent('Icon')

            return h('div', {
                class: 'flex items-center gap-2'
            }, [
                h(IconComponent, {  // Use the imported component reference, not a string
                    name: 'ph:pencil',
                    class: 'w-5 h-5',
                    onClick: () => handleEditSubCategory(row.original as ProductSubCategory)
                }),
                h(IconComponent, {  // Use the imported component reference, not a string
                    name: 'ph:trash',
                    class: 'w-5 h-5',
                    onClick: () => toggleDeleteSubCategoryDialog(row.original as ProductSubCategory)
                })
            ])
        }
    }, */
]

const data = ref<ProductSubCategory[]>([
    
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
                        Sub Categories
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
                    <h1 class="text-2xl font-bold">Sub Categories</h1>
                    <span class="text-sm text-gray-500">View your sub categories and the business they represent. Easily track and manage the list for seamless organization.</span>
                </span>
            </div>
        </div>
        <!-- Content of page -->
        <div class="flex flex-col justify-start items-start">
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
                    <Button v-if="checkPermission('create_product')" class="btn-primary px-3 py-2 rounded-lg" @click="handleAddSubCategory">
                        <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                        Add Sub Category
                    </Button>
                </template>
            </DynamicTable>
        </div>
        
        <!-- Add Sub Category Dialog -->
        <AddSubCategory v-model="addSubCategoryDialog" />

        <!-- Edit Sub Category Dialog -->
        <EditSubCategory 
            v-if="editSubCategoryDialog"
            v-model="editSubCategoryDialog"
            :subCategory="subCategoryInfo"
            @success="loadData"
        />

        <CustomAlertDialog
            v-if="deleteSubCategoryDialog"
            v-model="deleteSubCategoryDialog"
            :subCategory="subCategoryToDelete"
            @success="loadData"
            title="Delete Sub Category"
            description="Are you sure you want to delete this sub category?"
            :openDialog="deleteSubCategoryDialog"
            :onOpenChange="() => deleteSubCategoryDialog = false"
            :onConfirm="async () => {
                await handleDeleteSubCategory()
                deleteSubCategoryDialog = false
                await loadData()
            }"
        />
    </div>
</template>