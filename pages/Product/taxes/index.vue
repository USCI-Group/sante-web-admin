<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted, watch, resolveComponent } from 'vue'
import DynamicTable from '~/components/custom/DynamicTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useTax } from '@/composables/useTax'
import type { Tax } from '@/types/tax'
import type { Meta } from '@/types/common'
import AddTax from '@/pages/Product/taxes/add-tax.vue'
import EditTax from '@/pages/Product/taxes/edit-tax.vue'
import CustomAlertDialog from '~/components/custom/dialog/CustomAlertDialog.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const { getAllTaxes, deleteTax } = useTax()
const { me, getMe, checkPermission } = useUsers()

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const addTaxDialog = ref(false)
const editTaxDialog = ref(false)
const deleteTaxDialog = ref(false)
const taxInfo = ref<Tax>({} as Tax)

const { toast } = useToast()

onMounted(async () => {
    await getMe()
    try {
        await loadData()
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch taxes",
            variant: 'destructive'
        })
    }
})

watch(addTaxDialog, async (newVal) => {
    if (!newVal){
        await loadData()
    }
})

const loadData = async () => {
    try {
        const response: any = await getAllTaxes(me.value?.business_id ?? '', meta.value.page, meta.value.page_size)
        data.value = response.data || []
        if (response.meta) {
            meta.value.page = response.meta.page
            meta.value.page_size = response.meta.page_size
            meta.value.total = response.meta.total
            meta.value.total_pages = response.meta.total_pages
        }
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch taxes",
            variant: 'destructive'
        })
    }
}

const handleAddTax = async () => {
    addTaxDialog.value = !addTaxDialog.value
}

const handleEditTax = async (tax: Tax) => {
    taxInfo.value = tax
    editTaxDialog.value = !editTaxDialog.value
}

const toggleDeleteTaxDialog = (tax: Tax) => {
    taxInfo.value = tax
    deleteTaxDialog.value = !deleteTaxDialog.value
}

const handleDeleteTax = async () => {
    try {
        await deleteTax(taxInfo.value.id!)
        toast({
            title: 'Tax Deleted',
            description: 'Tax deleted successfully',
            variant: 'success'
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Failed to delete tax',
            variant: 'destructive'
        })
    }
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

const columns: ColumnDef<Tax, any>[] = [
    {
        header: 'Tax Name',
        accessorKey: 'name',
    },
    {
        header: 'External ID',
        accessorKey: 'external_id',
    },
    {
        header: 'Rate (%)',
        accessorKey: 'rate_percentage',
        cell: ({row}) => h('span', `${row.original.rate_percentage}%`)
    },
    {
        header: 'Type',
        accessorKey: 'is_inclusive',
        cell: ({row}) => h('span', {
            class: row.original.is_inclusive ? 'text-blue-600 bg-blue-100 px-2 py-1 rounded-md text-xs font-medium' : 'text-purple-600 bg-purple-100 px-2 py-1 rounded-md text-xs font-medium'
        }, row.original.is_inclusive ? 'Inclusive' : 'Exclusive')
    },
    {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({row}) => h('span', {
            class: row.original.is_active ? 'text-green-600' : 'text-red-600'
        }, row.original.is_active ? 'Active' : 'Inactive')
    },
    {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'actions',
        cell: ({row}) => {
            return h('div', {
                class: 'flex items-center gap-2'
            }, [
                checkPermission('create_product') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditTax(row.original as Tax),
                }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
                checkPermission('delete_product') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => toggleDeleteTaxDialog(row.original as Tax),
                }, () => h(Icon, { icon: 'heroicons:trash' }))
            ])
        }
    },
]

const data = ref<Tax[]>([])
</script>

<template>
    <div class="w-full h-full p-6">
        <Breadcrumb class="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Taxes</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Icon icon="heroicons:receipt-tax" class="w-6 h-6" />
                </div>
                <span class="flex flex-col">
                    <h1 class="text-2xl font-bold">Taxes</h1>
                    <span class="text-sm text-gray-500">Manage item-level taxes for your products. Map these to POS External IDs if using integrations.</span>
                </span>
            </div>
        </div>

        <div class="flex flex-col justify-start items-start">
            <DynamicTable 
                class="w-full"
                :columns="columns" 
                :data="data" 
                searchKey="name"
                :enableSelection="false"
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                :pageSize="meta.page_size"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disable-filter="true"
            >
                <template #toolbar-buttons>
                    <Button v-if="checkPermission('create_product')" class="btn-primary px-3 py-2 rounded-lg" @click="handleAddTax">
                        <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                        Add Tax
                    </Button>
                </template>
            </DynamicTable>
        </div>
        
        <AddTax v-model="addTaxDialog" />

        <EditTax 
            v-if="editTaxDialog"
            v-model="editTaxDialog" 
            :tax="taxInfo as Tax" 
            @success="loadData"
        />

        <CustomAlertDialog
            v-if="deleteTaxDialog"
            v-model="deleteTaxDialog"
            title="Delete Tax"
            description="Are you sure you want to delete this tax? This may affect existing products."
            :openDialog="deleteTaxDialog"
            :onOpenChange="() => deleteTaxDialog = false"
            :onConfirm="async () => {
                await handleDeleteTax()
                deleteTaxDialog = false
                await loadData()
            }"
        />
    </div>
</template>
