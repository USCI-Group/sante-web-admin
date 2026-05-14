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
import { h, ref, onMounted } from 'vue'
import CustomEnhancedDataTable from '~/components/custom/CustomEnhancedDataTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu } from '@/composables/useMenu'
import type { Menu, StockReport, ProductWastageStats, ProductWastageItemStat } from '@/types/menu'
import StockReportEditDialog from '~/components/custom/stock/StockReportEditDialog.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import type { Option } from '~/types/common'
import DynamicDialog from '~/components/custom/DynamicDialog.vue'
import * as XLSX from 'xlsx';

const {getStockReports, updateStockReport, getProductWastageStats} = useMenu()
const { getOutletsOptions, getOutletGroupsByUserId } = useOutlets()
const { me, getMe, checkPermission } = useUsers()

const currentPage = ref(1)
const pageSize = ref(5)

const { toast } = useToast()

const stockReportEditDialogData = ref({
    isOpen: false,
    isLoading: false,
    stockReport: {} as StockReport,
    form: {
        column: '',
        value: 0,
        date: new Date()
    },
    confirmationDialogIsOpen: false,
})

const outletOptions = ref<Option[]>([])

const filter = ref({
    date_range: [new Date(), new Date()],
    outlet_id: 'All Outlets',
})
const dateType = ref('Daily')

const data = ref<StockReport[]>([

])
const wastageStats = ref<ProductWastageStats>()

const columns: ColumnDef<StockReport, any>[] = [
    {
        header: 'Item',
        accessorKey: 'ingredient.name'
    },
    {
        header: 'Opening',
        accessorKey: 'opening',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return h('div', { class: 'flex items-center justify-between w-full' }, [
                h('span', {}, `${Number(row.original.opening).toFixed(2)} ${unit}`),
                checkPermission('update_stock') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditOpening(row.original, 'opening')
                }, () => h(Icon, { icon: 'heroicons:pencil-square' }))
            ]);
        }
    },
    {
        header: 'Sales',
        accessorKey: 'sales',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return `${Number(row.original.sales).toFixed(2)} ${unit}`;
        }
    },
    {
        header: 'Purchases',
        accessorKey: 'purchases',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return h('div', { class: 'flex items-center justify-between w-full' }, [
                h('span', {}, `${Number(row.original.purchases).toFixed(2)} ${unit}`),
                checkPermission('update_stock') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditOpening(row.original, 'purchases')
                }, () => h(Icon, { icon: 'heroicons:pencil-square' }))
            ]);
        }
    },
    {
        header: 'Transfer In',
        accessorKey: 'transfer_in',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return `${Number(row.original.transfer_in).toFixed(2)} ${unit}`;
        }
    },
    {
        header: 'Transfer Out',
        accessorKey: 'transfer_out',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return `${Number(row.original.transfer_out).toFixed(2)} ${unit}`;
        }
    },
    {
        header: 'Wastage',
        accessorKey: 'wastage',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return `${Number(row.original.wastage).toFixed(2)} ${unit}`;
        }
    },
    {
        header: 'Closing (system)',
        accessorKey: 'closing_by_system',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return `${Number(row.original.closing_by_system).toFixed(2)} ${unit}`;
        }
    },
    {
        header: 'Closing (actual)',
        accessorKey: 'closing',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            return h('div', { class: 'flex items-center justify-between w-full' }, [
                h('span', {}, `${Number(row.original.closing).toFixed(2)} ${unit}`),
                checkPermission('update_stock') && h(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: () => handleEditOpening(row.original, 'closing')
                }, () => h(Icon, { icon: 'heroicons:pencil-square' }))
            ]);
        }
    },
    {
        header: 'Variance',
        accessorKey: 'variance',
        cell: ({ row }) => {
            const unit = row.original.ingredient?.unit || '';
            const variance = row.original.variance;
            const isNegative = variance < 0;
            return h('span', {
                class: isNegative ? 'text-red-500' : '',
            }, `${Number(variance).toFixed(2)} ${unit}`);
        }
    }
]


onMounted(async () => {
    await getMe()
    await fetchOutletOptions()
    await fetchOutletGroupsByUserId()
    await loadData()
})

const fetchOutletOptions = async () => {
    try {
        const res = await getOutletsOptions(me.value?.business_id as string)
        outletOptions.value = res
    } catch (error: any) {
        outletOptions.value = []
    }
}

const fetchOutletGroupsByUserId = async () => {
    try {
        const res = await getOutletGroupsByUserId(me.value?.id as string)
        outletOptions.value = res.outlet_options
        res.outlet_groups.forEach(outlet_group => {
            outletOptions.value.unshift({
                id: outlet_group.id + '-area',
                name: outlet_group.name + ' (Area)'
            })
        });
    } catch (error: any) {
    }
}

const loadData = async () => {
    const filterData: any = {
        business_id: me.value?.business_id || '',
        outlet_id: filter.value.outlet_id === 'All Outlets' ? '' : filter.value.outlet_id,
        from_date: filter.value.date_range[0],
        to_date: filter.value.date_range[1],
    }

    if(filterData.outlet_id && filterData.outlet_id.includes('-area')){
        filterData.outlet_group_id = filterData.outlet_id.replace('-area', '')
        delete filterData.outlet_id
    }
    if(!filterData.outlet_id){
        delete filterData.outlet_id
    }
    if(!filterData.from_date){
        delete filterData.from_date
    }
    if(!filterData.to_date){
        delete filterData.to_date
    }

    try {
        const response = await getStockReports(filterData)
        data.value = response
    } catch (error: any) {
        data.value = []
    }
    
    const wastageStatsResponse = await getProductWastageStats(filterData)
    wastageStats.value = wastageStatsResponse
}

const handleViewAll = async () => {
    filter.value.outlet_id = 'All Outlets'
    filter.value.date_range = [new Date(), new Date()]
    dateType.value = 'Daily'
    await loadData()
}

const handleToggleFilters = () => {
    // stockReportFilterDialogData.value.isOpen = true
}

const handlePageChange = async (newPage:number) => {
    currentPage.value = newPage
}

const handlePageSizeChange = async (newPageSize:number) => {
    pageSize.value = newPageSize
    currentPage.value = 1
}

const handleEditOpening = (stockReport: StockReport, column: string) => {
    if(filter.value.outlet_id === 'All Outlets'){
        toast({
            title: 'Error',
            description: 'Please select an outlet',
            variant: 'destructive',
        })
        return
    }
    stockReportEditDialogData.value.isOpen = true
    stockReportEditDialogData.value.stockReport = stockReport
    stockReportEditDialogData.value.form.column = column
    stockReportEditDialogData.value.form.value = 0
    stockReportEditDialogData.value.form.date = filter.value.date_range[0]
}

const handleSaveButton = (form: any) => {
    stockReportEditDialogData.value.form.value = form.value
    stockReportEditDialogData.value.confirmationDialogIsOpen = true
}

const handleEditSubmit = async () => {
    stockReportEditDialogData.value.isLoading = true
    stockReportEditDialogData.value.confirmationDialogIsOpen = false

    try {
        await updateStockReport({
            outlet_id: filter.value.outlet_id,
            ingredient_id: stockReportEditDialogData.value.stockReport.ingredient?.id || '',
            date: stockReportEditDialogData.value.form.date,
            column: stockReportEditDialogData.value.form.column,
            value: stockReportEditDialogData.value.form.value
        })

        stockReportEditDialogData.value.isLoading = false
        stockReportEditDialogData.value.isOpen = false
        toast({
            title: 'Success',
            variant: 'success',
            description: 'Stock report updated successfully',
        })

        await loadData()

    } catch (error: any) {
        stockReportEditDialogData.value.isLoading = false
        toast({
            title: 'Error',
            variant: 'destructive',
            description: error.data?.message ?? 'Failed to update stock report',
        })
    }
}

watch(
    filter,
    async (newVal, oldVal) => {
    await loadData()
}, { deep: true })

watch(dateType, async () => {
    if(dateType.value === 'Daily'){
        filter.value.date_range = [new Date(), new Date()]
    } else if(dateType.value === 'Weekly'){
        const today = new Date()
        const day = today.getDay() // 0 (Sun) - 6 (Sat)
        const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
        const startOfWeek = new Date(today)
        startOfWeek.setDate(diffToMonday)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        filter.value.date_range = [startOfWeek, endOfWeek]
    } else if(dateType.value === 'Monthly'){
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        filter.value.date_range = [firstDay, lastDay]
    }
})

const exportStockReportToExcel = () => {
    const rows:any[] = [];

    const startDate = filter.value.date_range[0].toISOString().split('T')[0]
    const endDate = filter.value.date_range[1].toISOString().split('T')[0]
    const dateRangeString = startDate === endDate ? startDate.replace(/-/g, '/') : `${startDate.replace(/-/g, '/')}-${endDate.replace(/-/g, '/')}`
    
    for(let i = 0; i < (data.value?.length || 0); i++){
        const report = data.value?.[i] as StockReport
        rows.push({
            No: i + 1,
            Item: report.ingredient?.name,
            "Opening": Number(report.opening).toFixed(2),
            "Sales": Number(report.sales).toFixed(2),
            "Purchases": Number(report.purchases).toFixed(2),
            "Transfer In": Number(report.transfer_in).toFixed(2),
            "Transfer Out": Number(report.transfer_out).toFixed(2),
            "Wastage": Number(report.wastage).toFixed(2),
            "Closing (system)": Number(report.closing_by_system).toFixed(2),
            "Closing (actual)": Number(report.closing).toFixed(2),
            "Variance": Number(report.variance).toFixed(2),
        })
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Report');

    // Add another sheet (product wastage)
    const wastageRows: any[] = [];

    for(let i = 0; i < (wastageStats.value?.product_wastage_items.length || 0); i++){
        const wastage = wastageStats.value?.product_wastage_items[i] as ProductWastageItemStat
        wastageRows.push({
            'PRODUCT': wastage.product_name,
            ...Object.fromEntries(
                Object.entries(wastage.wastage_stats).map(([key, value]) => [key.toUpperCase(), value])
            ),
            'TOTAL WASTAGE': wastage.total_wastage,
        })
    }
    

    const wastageSheet = XLSX.utils.json_to_sheet(wastageRows);
    XLSX.utils.book_append_sheet(workbook, wastageSheet, 'Product Wastage');
    
    XLSX.writeFile(workbook, `stock-report(${dateRangeString}).xlsx`);
};

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
                        Stock Management
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
                    <h1 class="text-2xl font-bold">Stock Management</h1>
                    <span class="text-sm text-gray-500">View reports on stock usage</span>
                </span>
            </div>
        </div>

        <div class="flex flex-col gap-1 mb-5">
            <span class="text-sm text-gray-500"><span class="font-bold text-black">Closing (system) = </span>Opening + Purchases - Sales + Transfer In - Transfer Out - Wastage</span>
            <span class="text-sm text-gray-500"><span class="font-bold text-black">Variance = </span>Closing (system) - Closing (actual)</span>
        </div>

        <div class="mt-4">
            <div class="flex items-center justify-end w-full mb-2">
                <Button v-if="data.length > 0" @click="exportStockReportToExcel" class="btn-primary text-white">Export to Excel</Button>
            </div>
        </div>

        <div class="flex gap-4 justify-between">
            <div class="w-1/4">
                <Select v-model="filter.outlet_id">
                    <SelectTrigger>
                        <SelectValue placeholder="All Outlets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Outlets">All Outlets</SelectItem>
                        <SelectItem v-for="outlet in outletOptions" :key="outlet.id" :value="outlet.id">
                            {{ outlet.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div class="w-1/3">
                <div class="flex gap-4">
                    <div class="w-1/4">
                        <Button variant="outline" class="text-sm font-semibold" @click="handleViewAll()">
                            Clear Filter
                        </Button>
                    </div>
                    <div class="w-1/3">
                        <Select v-model="dateType" >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div class="w-full">
                        <VueDatePicker 
                            v-model="filter.date_range"
                            :enable-time-picker="false"
                            :range="true"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Content of page -->
        <div class="flex flex-col justify-start items-start mt-4">
            <CustomEnhancedDataTable    
                class="w-full"
                :totalRecords="data.length"
                :columns="columns"
                :data="data"
                :enableSelection="false"
                @viewAll="handleViewAll"
                @toggleFilters="handleToggleFilters"
                :currentPage="currentPage"
                :pageSize="pageSize"
                @pageChange="handlePageChange"
                @pageSizeChange="handlePageSizeChange"
                :disableToolbar="true"
            >
            </CustomEnhancedDataTable>
        </div>

        <hr class="my-5">
        <div class="flex flex-col px-5">
            <div class="flex flex-row items-center my-8 gap-4 justify-between">
                <div class="flex items-center gap-4">
                    <span class="flex flex-col">
                        <h1 class="text-2xl font-bold">Product Wastage</h1>
                        <span class="text-sm text-gray-500">View reports on product wastage</span>
                    </span>
                </div>
            </div>
    
            <div v-if="wastageStats">
                <table class="min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm my-2 mb-5">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th v-for="header in wastageStats.headers" :key="header" class="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider uppercase">{{ header }}</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Wastage</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-100">
                        <tr v-for="item in wastageStats.product_wastage_items" :key="item.product_id">
                            <td class="px-4 py-2 text-gray-700">{{ item.product_name }}</td>
                            <td v-for="header in wastageStats.headers" :key="header" class="px-4 py-2 text-gray-700">{{ item.wastage_stats[header] }}</td>
                            <td class="px-4 py-2 text-gray-700">{{ item.total_wastage }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <StockReportEditDialog
            :isOpen="stockReportEditDialogData.isOpen"
            :isLoading="stockReportEditDialogData.isLoading"
            :stockReport="stockReportEditDialogData.stockReport"
            :form="stockReportEditDialogData.form"
            @submit="handleSaveButton"
            @cancel="stockReportEditDialogData.isOpen = false"
        />

        <DynamicDialog
            :is-open="stockReportEditDialogData.confirmationDialogIsOpen"
            title="Confirm Edit"
            description="Are you sure you want to edit this stock report?"
            @confirm="handleEditSubmit"
            @cancel="stockReportEditDialogData.confirmationDialogIsOpen = false"
        />
    </div>
</template>