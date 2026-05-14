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
import DynamicTable from '~/components/custom/DynamicTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Meta, Option } from '@/types/common'
import type { GetFullReportResponse, FullReport } from '~/types/finance'
import VueDatePicker from '@vuepic/vue-datepicker';
import * as XLSX from 'xlsx';
import '@vuepic/vue-datepicker/dist/main.css'

const { getFullReports } = useFinances()
const { getOutletsOptions, getOutletGroupsByUserId } = useOutlets()
const { toast } = useToast()
const { getMe, me } = useUsers()
const router = useRouter()

const outletOptions = ref<Option[]>([])
const data = ref<GetFullReportResponse>()
const reportByPage = ref<FullReport[]>([])
const isLoading = ref(false)
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const outletId = ref<string>('All Outlets')
const dateType = ref<string>('Daily')
const dateRange = ref<Date[]>([new Date(), new Date()])

const columns: ColumnDef<FullReport, any>[] = [
    {
        header: 'Outlet',
        accessorKey: 'outlet_name',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
                row.original.outlet_image_url 
                    ? h('img', { 
                        src: row.original.outlet_image_url,
                        class: 'w-8 h-8 rounded-md object-cover'
                    })
                    : h(Icon, { 
                        icon: 'heroicons:building-storefront',
                        class: 'w-8 h-8 text-gray-400'
                    }),
                h('span', {}, row.original.outlet_name)
            ]);
        }
    },
    {
        header: 'Date',
        accessorKey: 'expenses_date',
        cell: ({ row }) => {
            if (!dateRange.value || dateRange.value.length !== 2) return '';
            
            const startDate = dateRange.value[0];
            const endDate = dateRange.value[1];
            
            return `${startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            })} - ${endDate.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            })}`;
        }
    },
    {
        header: 'Cash',
        accessorKey: 'cash',
        cell: ({ row }) => {
            return h('div', { class: 'text-gray-700' }, `RM ${row.original.cash.toFixed(2)}`)
        }
    },
    {
        header: 'QR',
        accessorKey: 'qr',
        cell: ({ row }) => {
            return h('div', { class: 'text-gray-700' }, `RM ${row.original.qr.toFixed(2)}`)
        }
    },
    {
        header: 'Grab',
        accessorKey: 'grab',
        cell: ({ row }) => {
            return h('div', { class: 'text-gray-700' }, `RM ${row.original.grab.toFixed(2)}`)
        }
    },
    {
        header: 'Shopee',
        accessorKey: 'shopee',
        cell: ({ row }) => {
            return h('div', { class: 'text-gray-700' }, `RM ${row.original.shopee.toFixed(2)}`)
        }
    },
    {
        header: 'Total',
        accessorKey: 'total_sales',
        cell: ({ row }) => {
            return h('div', { class: 'text-gray-700' }, `RM ${row.original.total_sales.toFixed(2)}`)
        }
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
                class: 'px-3 py-2 bg-[#F0FFF4] rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden'
            }, [
                h('div', { class: 'px-0.5 flex justify-center items-center' }, [
                    h('div', { 
                        class: 'justify-start text-[#008C4A] text-sm font-normal font-[\'Inter\'] leading-tight cursor-pointer',
                        onClick: () => {
                            handleViewDetails(row.original)
                        }
                    }, 'View Details')
                ])
            ])
        }
    },
]


onMounted(async () => {
    await getMe()
    await fetchOutletOptions()
    await fetchOutletGroupsByUserId()
    await loadData()
})

const fetchOutletOptions = async () => {
    try {
        outletOptions.value = await getOutletsOptions(me.value?.business_id as string)
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
    isLoading.value = true
    try {
        const filter: any = {
        }

        filter.business_id = me.value?.business_id as string

        if(outletId.value !== 'All Outlets'){
            filter.outlet_id = outletId.value
        }

        if(outletId.value.includes('-area')){
            filter.outlet_group_id = outletId.value.replace('-area', '')
            delete filter.outlet_id
        }

        if(dateRange.value.length > 0){
            filter.start_date = dateRange.value[0].toISOString()
            filter.end_date = dateRange.value[1].toISOString()
        }

        const response = await getFullReports(filter)
        
        data.value = response
        reportByPage.value = response.full_reports.slice((meta.value.page - 1) * meta.value.page_size, meta.value.page * meta.value.page_size)
        meta.value.total = response.full_reports.length
        meta.value.page = 1
        meta.value.total_pages = Math.ceil(response.full_reports.length / meta.value.page_size)
    } catch (error: any) {
        data.value = {
            total_sales_info: 0,
            total_sales_product: 0,
            total_sales_modifier: 0,
            full_reports: []
        }
    }
    isLoading.value = false
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  const reportListLength = data.value?.full_reports.length || 0
  meta.value.page = reportListLength > 0 ? 1 : 0
  meta.value.total_pages = Math.ceil(reportListLength / meta.value.page_size)
  reportByPage.value = data.value?.full_reports.slice((meta.value.page - 1) * meta.value.page_size, meta.value.page * meta.value.page_size) || []
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  reportByPage.value = data.value?.full_reports.slice((meta.value.page - 1) * meta.value.page_size, meta.value.page * meta.value.page_size) || []
}

const handleViewDetails = async (fullReport: FullReport) => {
    router.push(`/finance/full-report/details?id=${fullReport.outlet_id}&start_date=${dateRange.value[0].toISOString()}&end_date=${dateRange.value[1].toISOString()}`)
}

const exportToExcel = () => {
    const rows:any[] = [];

    const startDate = dateRange.value[0].toISOString().split('T')[0]
    const endDate = dateRange.value[1].toISOString().split('T')[0]
    const dateRangeString = startDate === endDate ? startDate.replace(/-/g, '/') : `${startDate.replace(/-/g, '/')}-${endDate.replace(/-/g, '/')}`
    
    for(let i = 0; i < (data.value?.full_reports.length || 0); i++){
        const report = data.value?.full_reports[i] as FullReport
        rows.push({
            No: i + 1,
            Date: dateRangeString,
            Outlet: report.outlet_name,
            "Cash Sales": report.cash,
            QR: report.qr,
            "Grab Food": report.grab,
            "Shopee Food ": report.shopee,
            "Total Sales": report.total_sales,
            "Labor": report.expense_category_labor,
            "Utilities and Services": report.expense_category_utilities_and_services,
            "Cleaning and Maintenance Supplies": report.expense_category_cleaning_and_maintenance_supplies,
            "Transportation and Logistics": report.expense_category_transportation_and_logistics,
            "Marketing and Promotion": report.expense_category_marketing_and_promotion,
            "Equipment and Supplies": report.expense_category_equipment_and_supplies,
            "Administration and Operational Supplies": report.expense_category_administration_and_operational_supplies,
            "Other": report.expense_category_other,
            "Total Expenses": report.total_expenses,
        })
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 20 },  // Date
        { wch: 30 },  // Outlet
        { wch: 10 },  // Cash
        { wch: 10 },  // QR
        { wch: 10 },  // Grab
        { wch: 10 },  // Shopee
        { wch: 10 },  // Total
        { wch: 10 },  // Labor
        { wch: 10 },  // Utilities and Services
        { wch: 10 },  // Cleaning and Maintenance Supplies
        { wch: 10 },  // Transportation and Logistics
        { wch: 10 },  // Marketing and Promotion
        { wch: 10 },  // Equipment and Supplies
        { wch: 10 },  // Administration and Operational Supplies
        { wch: 10 },  // Other
        { wch: 10 },  // Total Expenses
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Full Report export');

    
    XLSX.writeFile(workbook, `full-report-export(${dateRangeString}).xlsx`);
};

watch(outletId, async () => {
    meta.value.page = 1
    await loadData()
})

watch(dateRange, async () => {
    await loadData()
})

watch(dateType, async () => {
    if(dateType.value === 'Daily'){
        dateRange.value = [new Date(), new Date()]
    } else if(dateType.value === 'Weekly'){
        const today = new Date()
        const day = today.getDay() // 0 (Sun) - 6 (Sat)
        const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1)
        const startOfWeek = new Date(today)
        startOfWeek.setDate(diffToMonday)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        dateRange.value = [startOfWeek, endOfWeek]
    } else if(dateType.value === 'Monthly'){
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        dateRange.value = [firstDay, lastDay]
    }
})


</script>

<style scoped></style>

<template>
    <div class="w-full h-full p-6">

        <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="flex flex-col items-center">
                <svg class="animate-spin h-12 w-12 text-[#00A859]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span class="mt-4 text-white text-lg font-semibold">Loading...</span>
            </div>
        </div>
        
        <Breadcrumb class="mb-3">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <NuxtLink to="/">
                            <Icon icon="heroicons:home" class="w-6 h-6 hover:text-[#00A859] transition-colors cursor-pointer" />
                        </NuxtLink>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-fit bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:document-chart-bar" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Full Report</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <hr>

         <!-- Header title of page -->
        <div class="flex flex-row items-center my-4 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                    <Icon icon="heroicons:flag" class="w-6 h-6" />
                </div>
                <span class="flex flex-col">
                    <h1 class="text-2xl font-bold">Full Report</h1>
                    <span class="text-sm text-gray-500">A comprehensive overview of all relevant data and activities within a selected period.</span>
                </span>
            </div>
        </div>

        <div class="flex gap-4 justify-between">
            <div class="w-1/4">
                <Select v-model="outletId">
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
                    <div class="w-2/3">
                        <VueDatePicker 
                            v-model="dateRange"
                            :enable-time-picker="false"
                            :range="true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="border rounded-lg p-4 mt-4">
            <div class="flex flex-row gap-8 justify-evenly">
                <div class="flex flex-col items-center justify-center">
                    <Icon icon="heroicons:building-library" class="w-6 h-6 text-primary" />
                    <div class="text-lg font-semibold">RM {{ data?.total_sales_info.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                    <div class="text-sm text-gray-500">Sales Information</div>
                </div>

                <div class="h-16 w-px bg-gray-200"></div>

                <!-- <div class="flex flex-col items-center justify-center">
                    <Icon icon="heroicons:squares-2x2" class="w-6 h-6 text-primary" />
                    <div class="text-lg font-semibold">RM</div>
                    <div class="text-sm text-gray-500">Sales Category</div>
                </div>

                <div class="h-16 w-px bg-gray-200"></div> -->

                <div class="flex flex-col items-center justify-center">
                    <Icon icon="heroicons:archive-box" class="w-6 h-6 text-primary" />
                    <div class="text-lg font-semibold">RM {{ data?.total_sales_product.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                    <div class="text-sm text-gray-500">Sales Product</div>
                </div>

                <div class="h-16 w-px bg-gray-200"></div>

                <div class="flex flex-col items-center justify-center">
                    <Icon icon="heroicons:cog-8-tooth" class="w-6 h-6 text-primary" />
                    <div class="text-lg font-semibold">RM {{ data?.total_sales_modifier.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
                    <div class="text-sm text-gray-500">Total Modifier</div>
                </div>

            </div>
        </div>

        <div class="mt-4">
            <div class="flex items-center justify-between w-full mb-2">
                <div class="text-lg font-semibold">Outlet Report</div>
                <Button v-if="reportByPage.length > 0" @click="exportToExcel" class="btn-primary text-white">Export to Excel</Button>
            </div>
        </div>

        <!-- Content of page -->
        <div class="mt-4 flex flex-col justify-start items-start">
            <DynamicTable 
                class="w-full"
                :columns="columns" 
                :data="reportByPage" 
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disableToolbar="true"
            >
                <template #toolbar-buttons>
                </template> 
            </DynamicTable>
        </div>
    </div>
</template>