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
import type { ExpensesOutlet } from '~/types/finance'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


const { getPayoutReports } = useFinances()
const { getOutletsOptions, getOutletGroupsByUserId } = useOutlets()
const { toast } = useToast()
const { getMe, me } = useUsers()
const router = useRouter()

const data = ref<ExpensesOutlet[]>([])
const outletOptions = ref<Option[]>([])
const date = ref<Date | null>(null)
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const outletId = ref<string>('All Outlets')

const columns: ColumnDef<ExpensesOutlet, any>[] = [
    {
        header: 'Outlet',
        accessorKey: 'outlet',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2' }, [
                row.original.outlet?.image_url 
                    ? h('img', { 
                        src: row.original.outlet.image_url,
                        class: 'w-8 h-8 rounded-md object-cover'
                    })
                    : h(Icon, { 
                        icon: 'heroicons:building-storefront',
                        class: 'w-8 h-8 text-gray-400'
                    }),
                h('span', {}, row.original.outlet?.name)
            ]);
        }
    },
    {
        header: 'Date',
        accessorKey: 'expenses_date',
        cell: ({ row }) => {
            const date = new Date(row.original.expenses_date);
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
                timeZone: 'Asia/Kuala_Lumpur'
            });
        }
    },
    {
        header: 'Expenses Category',
        accessorKey: 'expenses_category',
    },
    {
        header: 'Remarks',
        accessorKey: 'expenses_description',
    },
    {
        header: 'Price',
        accessorKey: 'expenses_amount',
        cell: ({ row }) => {
            return `RM ${Number(row.original.expenses_amount).toFixed(2)}`;
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
                class: 'flex items-center gap-1'
            }, [
                h('div', { class: 'px-0.5 flex justify-center items-center' }, [
                    h('div', { 
                        class: 'px-3 py-2 bg-[#FFF4ED] rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden text-[#FF4405] text-sm font-normal font-[\'Inter\'] leading-tight cursor-pointer',
                        onClick: () => {
                            handleViewDetails(row.original)
                        }
                    }, 'View Details')
                ]),
                row.original.expenses_attachment_url
                  ? h('div', { class: 'px-0.5 flex justify-center items-center' }, [
                        h('div', { 
                            class: 'px-3 py-2 bg-[#F0FFF4] rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden text-[#008C4A] text-sm font-normal font-[\'Inter\'] leading-tight cursor-pointer',
                            onClick: () => {
                                downloadFromS3(row.original.expenses_attachment_url)
                            }
                        }, 'Download')
                    ])
                  : null
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
    try {
        const filter: any = {
            page: meta.value.page,
            page_size: meta.value.page_size,
        }

        if(outletId.value !== 'All Outlets'){
            filter.outlet_id = outletId.value
        }

        if(outletId.value.includes('-area')){
            filter.outlet_group_id = outletId.value.replace('-area', '')
            delete filter.outlet_id
        }

        if(date.value){
            filter.date = date.value.toISOString()
        }

        const response = await getPayoutReports(filter)
        data.value = response.data || []
        meta.value = response.meta
    } catch (error: any) {
        data.value = []
    }
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  await loadData()
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  await loadData()
}

const handleViewDetails = async (transaction: ExpensesOutlet) => {
    router.push(`/finance/payout-report/details?id=${transaction.id}`)
}

watch(outletId, async () => {
    meta.value.page = 1
    await loadData()
})

watch(date, async () => {
    meta.value.page = 1
    await loadData()
})

const handleViewAll = async () => {
    outletId.value = 'All Outlets'
    date.value = null
    await loadData()
}

const downloadFromS3 = async (url: string) => {
  try {
    const response = await fetch(url, {
      mode: 'cors'
    });

    if (!response.ok) throw new Error('Failed to fetch file');

    const blob = await response.blob();
    const filename = url.split('/').pop();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename ?? '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Download failed:', err);
    alert('Could not download file. Make sure the S3 URL is public and CORS is enabled.');
  }
};


</script>

<style scoped></style>

<template>
    <div class="w-full h-full p-6">
        <Breadcrumb class="mb-6">
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
                            <Icon icon="heroicons:document-text" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Payout Report</p>
                        </div>
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
                    <h1 class="text-2xl font-bold">Payout Report</h1>
                    <span class="text-sm text-gray-500">A detailed summary of all payments or disbursements made over a specific period.</span>
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
            
            <div class="flex items-center gap-2">
                <Button variant="outline"
                    class="text-sm font-semibold"
                    @click="handleViewAll()">
                    View all
                </Button>
                <VueDatePicker 
                    :enable-time-picker="false"
                    v-model="date"
                />
            </div>
        </div>
        
        <!-- Content of page -->
        <div class="flex flex-col justify-start items-start mt-4">
            <DynamicTable 
                class="w-full"
                :columns="columns" 
                :data="data" 
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disableToolbar="true"
            >
                <template #toolbar-buttons>
                    <!-- <Button @click="handleAddUserButton"
                        class="btn-primary">
                        <Icon icon="ph:plus-bold" class="w-4 h-4" />
                        Add User
                    </Button> -->
                </template> 
            </DynamicTable>
        </div>
    </div>
</template>