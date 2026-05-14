<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CustomEnhancedDataTable from '~/components/custom/CustomEnhancedDataTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu } from '@/composables/useMenu'
import type { Product, Menu, Ingredient } from '@/types/menu'
import CustomAlertDialog from '~/components/custom/dialog/CustomAlertDialog.vue' 
import CustomDynamicTable from '~/components/custom/table/CustomDynamicTable.vue'
import CustomCardTable from '~/components/custom/table/CustomCardTable.vue'
import type { Meta } from '@/types/common'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/ProductStore'
import { useModifierStore } from '@/stores/ModifierStore'
import type { ModifierGroup } from '@/types/menu'
import EditDeleteBox from '~/components/custom/edit-delete-box/edit-delete-box.vue'
import Tooltip from '~/components/custom/Tooltip.vue'


const { me, getMe, isBusinessAdmin, checkPermission } = useUsers()
const productStore = useProductStore()
const modifierStore = useModifierStore()
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')

const router = useRouter()
const route = useRoute()
const addProductDialog = ref(false)
const productInfo = ref<Product>()
const productEditDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteTitle = ref('Delete Product')
const deleteDescription = ref('Are you sure you want to delete this product?')
const productToDelete = ref<Product>()

const openMenuIndex = ref<number | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const { toast } = useToast()
const {getAllMenuProducts, deleteProductByID, getModifierList, syncMenuToGrab, syncMenuToShopeeForAllOutlets} = useMenu()
const activeTab = ref('products')

onMounted(async () => {
    await getMe()
    document.addEventListener('click', handleClickOutside)

    try {
        const response = await loadData().catch(error => {
            throw new Error(error.message || "Failed to fetch menu products")
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

onActivated(async () => {
    await getMe()
    loadData()
})

watch(searchQuery, async (newVal) => {
    currentPage.value = 1
    await loadData()
}, { deep: true })

watch(
  () => route.query,
  async (newQuery) => {
    if (newQuery.refresh == 'true') {
      await loadData()
    }
  },
  { deep: true }
)

watch(addProductDialog, async (newVal) => {
    if (!newVal){
        await loadData()
    }
})

const loadData = async () => {
    try {
        const body: any = {
            business_id: me.value?.business_id as string,
            page: currentPage.value,
            page_size: pageSize.value,
        }
        if (searchQuery.value) {
            body.search = searchQuery.value
        }
        const menuProducts: any = await getAllMenuProducts(body)
        // sort data by date created oldest to newest
        //const sortedData = menuProducts.data.sort((a: Menu, b: Menu) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime())
        data.value = menuProducts.data ?? [] as Menu[]
        if (menuProducts.meta) {
            meta.value = {
                total: menuProducts.meta.total,
                page: menuProducts.meta.page,
                page_size: menuProducts.meta.page_size,
                total_pages: menuProducts.meta.total_pages === 0 && menuProducts.meta.total > 0 
                    ? 1 
                    : menuProducts.meta.total_pages
            }
        } else {
            meta.value = {
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 1
            }
        }
    } catch (error: any) {
        data.value = []
        meta.value = {
            total: 0,
            page: 1,
            page_size: 10,
            total_pages: 1
        }
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        openMenuIndex.value = null
    }
}

const handleTabChange = async (newVal: string | number) => {
    if (newVal === 'modifiers') {
        await loadModifierList()
    } else {
        await loadData()
    }
}

const loadModifierList = async () => {
    try {
        const modifierList: any = await getModifierList(me.value?.business_id as string)
        // sort data by date created oldest to newest
        const sortedData = modifierList.data.sort((a: ModifierGroup, b: ModifierGroup) => new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime())
        //modifierData.value = [] as ModifierGroup[]
        modifierData.value = sortedData ?? [] as ModifierGroup[]
    } catch (error: any) {
        modifierData.value = []
    }
}

const handleAddProduct = async () => {
    router.push({
        path: '/product/products/product-creation'
    })
}

const handleProductDetails = (product: Product) => {
    productStore.setCurrentProduct(product)
    router.push({
        path: '/product/products/details',
        query: {
            id: product.id
        }
    })
}

const handleEditProduct = (product: Product) => {
    productInfo.value = product
    productEditDialog.value = !productEditDialog.value
}

const triggerDeleteDialog = (product: Product) => {
    if (product === null || product === undefined){
        productToDelete.value = <Product>{};
        return;
    }
    productToDelete.value = product
    deleteProductDialog.value = !deleteProductDialog.value

}

const handleDeleteProduct = async (product: Product) => {
    try{
        const response = await deleteProductByID(product,me.value?.business_id as string).catch(error => {
            // Handle the rejected promise
            console.error("API Error:", error)
            throw new Error(error.message || "Failed to delete product")
        })

        await loadData()
        toast({
            title: 'Success',
            description: "Product deleted successfully",
            variant: 'success'
        })
    } catch (error : any ){
        toast({
            title: 'Error',
            description: "Failed to delete product",
            variant: 'destructive'
        })
    }
    
}

const handleCreateModifier = () => {
    router.push({
        path: '/product/products/modifier-creation',
        
    })
}

const handleViewModifierDetails = (id: string) => {
    const finalModifier = modifierData.value.find(modifier => modifier.id === id)
    modifierStore.setCurrentModifier(finalModifier as ModifierGroup)
    router.push({
        path: '/product/products/modifier-details',
        query: {
            id: id
        }
    })
}

const handleViewAll = () => {
    console.log('View all clicked')
}

const handleToggleFilters = () => {
    console.log('Toggle filters clicked')
}

const handlePageChange = async (newPage:number) => {
    currentPage.value = newPage
    await loadData()
}

const handlePageSizeChange = async (newPageSize:number) => {
    pageSize.value = newPageSize
    currentPage.value = 1
    await loadData()
}

const handleSyncMenuToOnlinePlatform = async () => {
    try{
        await syncMenuToGrab(me.value?.business_id as string)
        toast({
            title: 'Success',
            description: "Grab syncing in process..",
            variant: 'success'
        })

    } catch (error: any){
        toast({
            title: 'Error',
            description: error.data?.message || "Failed to sync menu to Grab",
            variant: 'destructive'
        })
    }

    try{
        await syncMenuToShopeeForAllOutlets(me.value?.business_id as string)
        toast({
            title: 'Success',
            description: "Shopee syncing in process..",
            variant: 'success'
        })
    } catch (error: any){
        toast({
            title: 'Error',
            description: error.data?.message || "Failed to sync menu to Shopee",
            variant: 'destructive'
        })
    }
}

const columns: ColumnDef<Menu, any>[] = [
    {
        header: 'Product Name',
        accessorKey: 'name',
        cell: ({ row }) => h('div', { class: 'flex items-center gap-2' }, [
            h('img', { 
                src: row.original.image_url || '', 
                class: 'w-8 h-8 object-cover rounded-lg' 
            }),
            h('span', row.original.name)
        ])
    },
    {
        header: 'Product Category',
        accessorKey: 'product_category',
        cell: ({ row }) => row.original.product_category.length > 0 
            ? row.original.product_category.map(c => c.name).join(', ')
            : 'No categories'
    },
    /* {
        header: 'Description',
        accessorKey: 'description',
    }, */
    {
        header: 'Ingredients',
        accessorKey: 'ingredients',
        cell: ({ row }) => {
            if (row.original.ingredients && row.original.ingredients.length > 0) {
                return row.original.ingredients.map((ingredient: Ingredient) => ingredient.name).join(', ');
            } else {
                return 'No ingredients';
            }
        }
    },
    {
        header: 'Product Selling Price',
        accessorKey: 'price',
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({row}) => {
            return h('div', {
                'data-hierarchy': 'Primary',
                'data-icon': 'Default',
                'data-size': 'sm',
                'data-state': 'Default',
                'data-icon-trailing': 'false',
                'data-icon-leading': 'false',
                class: 'px-3 py-2 bg-[#FFF4ED] rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden'
            }, [
                h('div', { class: 'px-0.5 flex justify-center items-center' }, [
                    h('div', { 
                        class: 'justify-start text-[#FF4405] text-sm font-normal font-[\'Inter\'] leading-tight ' + (checkPermission('read_product') ? 'cursor-pointer' : 'text-gray-400 cursor-not-allowed'),
                        onClick: checkPermission('read_product') ? () => handleProductDetails(row.original as Product) : undefined
                    }, 'View Details')
                ])
            ])
        }
    },
    {
        id: 'edit',
        header: '',
        accessorKey: 'edit',
        cell: ({row}) => {
            // Hide entire row if delete is not permitted
            if (!checkPermission('delete_product')) {
                return null
            }
            
            return h('div', {
                ref: menuRef,
                class: 'px-3 py-2 inline-flex justify-center items-center gap-1 overflow-hidden cursor-pointer'
            }, [
                h(Icon, { 
                    icon: 'heroicons:ellipsis-vertical', 
                    class: 'w-5 h-5 text-[#00A859]',
                    onClick: (e: MouseEvent) => {
                        e.stopPropagation()
                        openMenuIndex.value = openMenuIndex.value === row.index ? null : row.index
                    }
                }),
                openMenuIndex.value === row.index && h(EditDeleteBox, {
                    class: 'absolute right-0 z-10 mt-20',
                    editLabel: 'Edit',
                    deleteLabel: 'Delete',
                    editAction: () => {
                        handleEditProduct(row.original as Product)
                        openMenuIndex.value = null
                    },
                    deleteAction: () => {
                        triggerDeleteDialog(row.original as Product)
                        openMenuIndex.value = null
                    },
                    onClick: (e: MouseEvent) => e.stopPropagation(),
                })
                /* h(Menubar, {
                    class: 'w-5 h-5 text-[#00A859]'
                }, [
                    h(MenubarTrigger, {}, [
                        h(Icon, {
                            icon: 'heroicons:ellipsis-vertical',
                            class: 'w-5 h-5 text-[#00A859]'
                        })
                    ]),
                    h(MenubarContent, {
                        class: 'w-5 h-5 text-[#00A859]'
                    }, [
                        h(MenubarItem, {
                            class: 'w-5 h-5 text-[#00A859]',
                            onClick: () => handleEditProduct(row.original as Product)
                        }, 'Edit'),
                        h(MenubarItem, {
                            class: 'w-5 h-5 text-[#00A859]',
                            onClick: () => triggerDeleteDialog(row.original as Product)
                        }, 'Delete')
                    ])
                ]) */
            ])
        }
    },
    
    /* {
        header: 'Sub Categories',
        accessorKey: 'product_sub_category',
        cell: ({ row }) => row.original.product_sub_category.map(c => c.name).join(', ')
    }, */
    /* {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({row}) => {
            const IconComponent = resolveComponent('Icon')

            return h('div', {
                class: 'flex items-center gap-2'
            }, [
                h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditProduct(row.original as Product),
                }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
                h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => triggerDeleteDialog(row.original as Product),
                }, () => h(Icon, { icon: 'heroicons:trash' }))
            ])
        }
    }, */
]

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const data = ref<Menu[]>([
    
])

const modifierData = ref<ModifierGroup[]>([

])

</script>

<style scoped></style>

<template>
   
    <div :key="$route.fullPath" class="w-full h-full p-6">
        <Breadcrumb class="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <Icon icon="heroicons:home" class="w-6 h-6" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-454px] w-fit bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:shopping-bag" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Product Management</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
         <!-- Header title of page -->
        <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-lg font-medium">Product Management</h1>
                    <span class="text-sm text-gray-500">View your clients and the businesses they represent. Easily track and manage the list for seamless organisation.</span>
                </span>
            </div>
            
        </div>

        <div class="flex justify-end" v-if="isBusinessAdmin()">
            <Tooltip 
                text="Please run this action if you want to sync your menu to Grab. 
                This will take some time to complete depending on the number of products 
                and modifiers in your menu, and based on the number of registered grab outlets." 
                position="left"
            >
                <!-- <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" /> -->
                <Button v-if="checkPermission('create_product')"
                    class="bg-green-500 hover:bg-green-600 text-white mb-3" 
                    @click="handleSyncMenuToOnlinePlatform"
                >
                    <Icon icon="heroicons:arrow-path" class="w-4 h-4" />
                    Sync Menu to Grab/Shopee
                </Button>
            </Tooltip>
        </div>

        <Tabs 
            defaultValue="products"
            @update:modelValue="handleTabChange"
        >
            <TabsList class="grid w-full grid-cols-2 rounded-lg">
                <TabsTrigger 
                    value="products" 
                    class="w-full data-[state=active]:bg-[#F0FDF4] data-[state=active]:text-[#00A859]"
                    @click="activeTab = 'products'"
                    >Product List
                </TabsTrigger>
                <TabsTrigger 
                    value="modifiers" 
                    class="w-full data-[state=active]:bg-[#F0FDF4] data-[state=active]:text-[#00A859]"
                    @click="activeTab = 'modifiers'"
                    >Modifier List
                </TabsTrigger>
            </TabsList>
            <TabsContent value="products">
                <div class="flex flex-col lg:flex-row items-start lg:items-center pt-4">
                    <!-- Search Input -->
                    <div class="relative w-96">
                        <span class="absolute inset-y-0 left-3 flex items-center">
                            <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                        </span>
                        <Input 
                            placeholder="Search"
                            v-model="searchQuery"
                            class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                        />
                    </div>

                    <!-- Toolbar Buttons -->
                    <div class="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
                        <!-- Action Buttons -->
                        <div class="flex items-center gap-2">
                            <Button v-if="checkPermission('create_product')"
                                class="btn-primary px-3 py-2 rounded-lg" 
                                @click="handleAddProduct">
                                <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                                Add Product
                            </Button>
                        </div>
                    </div>
                </div>
                <CustomDynamicTable
                    v-if="activeTab === 'products'"
                    class="w-full"
                    :columns="columns" 
                    :data="data" 
                    :enableSelection="true"
                    :currentPage="meta.page"
                    :totalPages="meta.total_pages"
                    :pageSize="meta.page_size"   
                    :emptyTitle="'No Product Found'"
                    :empty-description="'You haven’t added any Product yet. Please create an Product to get started.'"                         
                    @viewAll="handleViewAll"
                    @toggleFilters="handleToggleFilters"
                    @pageSizeChange="handlePageSizeChange"
                    @pageChange="handlePageChange"
                    @addProduct="handleAddProduct"
                    @refreshData="loadData"
                    :disableFilter="true"
                    :disableToolbar="true"
                    :hideAddButton="!checkPermission('create_product')"
                    slot-name="toolbar-buttons"
                />
                <div v-else>
                    <div class="flex flex-col items-center justify-center py-12">
                        <h3 class="text-lg font-semibold text-gray-900">No Data Found</h3>
                        <p class="text-sm text-gray-500 mt-2 max-w-72">
                            No items have been added yet.
                        </p>
                        <Button v-if="checkPermission('create_product')"
                            class="btn-primary mt-4" 
                            @click="handleAddProduct"
                        >
                            <Icon icon="ph:plus-bold" class="w-4 h-4" />
                            Add Product
                        </Button>
                    </div>
                </div>

            </TabsContent>
            <TabsContent value="modifiers">
                <CustomCardTable
                    v-if="activeTab === 'modifiers'"
                    :columns="columns"
                    :data="data"
                    class="w-full"
                    searchKey="name"
                    :enableSelection="true"
                    :currentPage="meta.page"
                    :totalPages="meta.total_pages"
                    :pageSize="meta.page_size" 
                    addButtonLabel='Add Modifier'
                    cardButtonLabel='View Details'
                    @viewAll="handleViewAll"
                    @toggleFilters="handleToggleFilters"
                    @pageSizeChange="handlePageSizeChange"
                    @pageChange="handlePageChange"
                    @toolbarButtonAction="handleCreateModifier"
                    :cardData="modifierData"
                    @refreshData="loadModifierList"
                    @cardButtonAction="handleViewModifierDetails"
                    :disable-filter="true"
                    :hideAddButton="!checkPermission('create_product')"
                />
                <!-- <div v-else>
                    <div class="flex flex-col items-center justify-center py-12">
                        <h3 class="text-lg font-semibold text-gray-900">No Data Found</h3>
                        <p class="text-sm text-gray-500 mt-2 max-w-72">
                            {{ emptyDescription || 'No items have been added yet.' }}
                        </p>
                        <Button 
                            v-if="emptyButtonLabel"
                            class="btn-primary mt-4" 
                            @click="$emit('emptyStateAction')"
                        >
                            <Icon icon="ph:plus-bold" class="w-4 h-4" />
                            {{ emptyButtonLabel }}
                        </Button>
                    </div>
                </div> -->
            </TabsContent>

        </Tabs>
        
        <!-- Delete Product Dialog -->
        <CustomAlertDialog 
            v-if="deleteProductDialog" 
            v-model="deleteProductDialog" 
            :title="deleteTitle" 
            :description="deleteDescription" 
            :openDialog="deleteProductDialog" 
            :onOpenChange="() => deleteProductDialog = false" 
            :onConfirm="async () => {
                await handleDeleteProduct(productToDelete as Product)
                deleteProductDialog = false
            }" 
        />
    </div>
</template>