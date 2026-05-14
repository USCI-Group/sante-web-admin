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
import { useMenu } from '@/composables/useMenu'
import type { Product, Menu, StockReport } from '@/types/menu'
import CustomAlertDialog from '~/components/custom/dialog/CustomAlertDialog.vue' 
import ActivityFilterDialog from '~/components/custom/activity-log/ActivityFilterDialog.vue'
import TransactionFilterDialog from '~/components/custom/finance/TransactionFilterDialog.vue'
import type { Meta, SelectOption } from '@/types/common'
import type { FinanceTransaction } from '~/types/finance'
import { PaymentMethod } from '~/constants/payment'
const { getTransactions } = useFinances()
const { toast } = useToast()
const router = useRouter()

const searchTransaction = ref('')
const transactionFilterDialogData = ref({
    isOpen: false,
    isLoading: false,
    filter: {
        payment_methods: [] as SelectOption[],
        products: [] as SelectOption[],
        outlet_id: 'All Outlets',
        outlet_group_id: ''
    }
})

const data = ref<FinanceTransaction[]>([])

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const columns: ColumnDef<FinanceTransaction, any>[] = [
    {
        header: 'Receipt No',
        accessorKey: 'receipt_no'
    },
    {
        header: 'Outlet',
        accessorKey: 'outlet_name'
    },
    {
        header: 'Product Name',
        accessorKey: 'product_names',
        cell: ({ row }) => {
            return `${row.original.product_names}`;
        }
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
            return h("div", {
                class: {
                    'rounded-lg capitalize inline-flex items-center justify-center font-medium': true,
                    'text-green-600': row.original.status === 'completed',
                    'text-red-600': row.original.status === 'cancelled',
                    'text-yellow-600': row.original.status !== 'completed' && row.original.status !== 'cancelled'
                }
            }, row.original.status)
        }
    },
    {
        header: 'Time',
        accessorKey: 'time',
        cell: ({ row }) => {
            const date = new Date(row.original.transaction_date);
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone: 'Asia/Kuala_Lumpur'
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kuala_Lumpur'
            });
            return `${formattedDate} ${formattedTime}`;
        }
    },
    {
        header: 'Payment Method',
        accessorKey: 'payment_method',
        cell: ({ row }) => {
            const isGrabPayment = row.original.payment_method === 'CASH' || row.original.payment_method === 'CASHLESS';
            
            return h("div", {
                class: {
                    'px-3 py-1 rounded-lg capitalize inline-flex items-center justify-center gap-2': true,
                    'bg-gray-300 text-gray-800': row.original.payment_method === PaymentMethod.FPX,
                    'bg-blue-300 text-blue-800': row.original.payment_method === PaymentMethod.EWallet,
                    'bg-green-300 text-green-800': row.original.payment_method === PaymentMethod.Cash,
                    'bg-[#FFD26D] text-[#966D11]': row.original.payment_method === PaymentMethod.BNPL,
                    'bg-yellow-300 text-yellow-800': row.original.payment_method === PaymentMethod.CreditCard || row.original.payment_method === PaymentMethod.DebitCard,
                    'bg-purple-300 text-purple-800': row.original.payment_method === PaymentMethod.StaticQR
                }
            }, [
                row.original.payment_method.replace(/_/g, ' '),
                isGrabPayment ? h(Icon, { icon: "simple-icons:grab", class: "w-10 h-10" }) : null
            ].filter(Boolean))
        }
    },
    {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => {
            return `RM ${row.original.price}`;
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
                class: 'px-3 py-2 bg-[#FFF4ED] rounded-lg inline-flex justify-center items-center gap-1 overflow-hidden'
            }, [
                h('div', { class: 'px-0.5 flex justify-center items-center' }, [
                    h('div', { 
                        class: 'justify-start text-[#FF4405] text-sm font-normal font-[\'Inter\'] leading-tight cursor-pointer',
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

const loadData = async () => {
    const paymentMethods = transactionFilterDialogData.value.filter.payment_methods.filter(paymentMethod => paymentMethod.selected).map(paymentMethod => paymentMethod.id)
    const productIds = transactionFilterDialogData.value.filter.products.filter(product => product.selected).map(product => product.id)
    try {
        const filter: any = {
            page: meta.value.page,
            page_size: meta.value.page_size,
            payment_methods: paymentMethods,
            product_ids: productIds
        }

        if(transactionFilterDialogData.value.filter.outlet_id !== 'All Outlets'){
            filter.outlet_id = transactionFilterDialogData.value.filter.outlet_id
        }

        if(transactionFilterDialogData.value.filter.outlet_group_id){
            filter.outlet_group_id = transactionFilterDialogData.value.filter.outlet_group_id
            delete filter.outlet_id
        }

        if(searchTransaction.value){
            filter.search = searchTransaction.value
        }

        // if(!filter.from_date){
        //     delete filter.from_date
        // }

        const response = await getTransactions(filter)
        data.value = response.data || []
        meta.value = response.meta
    } catch (error: any) {
        data.value = []
    }
}

const handleViewAll = async () => {
    transactionFilterDialogData.value.filter.payment_methods = transactionFilterDialogData.value.filter.payment_methods.map(paymentMethod => ({
      ...paymentMethod,
      selected: false
    }))

    transactionFilterDialogData.value.filter.products = transactionFilterDialogData.value.filter.products.map(product => ({
      ...product,
      selected: false
    }))

    transactionFilterDialogData.value.filter.outlet_id = 'All Outlets'
    transactionFilterDialogData.value.filter.outlet_group_id = ''
    meta.value.page = 1
    await loadData()
}

const handleToggleFilters = () => {
    transactionFilterDialogData.value.isOpen = true
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

const handleFilterSubmit = async (filter: {
    payment_methods: SelectOption[]
    products: SelectOption[]
}) => {
    transactionFilterDialogData.value.isLoading = true
    transactionFilterDialogData.value.filter.payment_methods = filter.payment_methods
    transactionFilterDialogData.value.filter.products = filter.products
    meta.value.page = 1
    await loadData()
    transactionFilterDialogData.value.isLoading = false
    transactionFilterDialogData.value.isOpen = false
}

const handleViewDetails = async (transaction: FinanceTransaction) => {
    router.push(`/finance/transaction/details?id=${transaction.order_id}`)
}

let debounceTimer: any = null
watch(searchTransaction, async (newVal: string) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
        meta.value.page = 1
        await loadData()
    }, 500)
})

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
                            <Icon icon="heroicons:clock" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Transaction</p>
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
                    <h1 class="text-2xl font-bold">Transaction</h1>
                    <span class="text-sm text-gray-500">The exchange of goods, services, or funds between two or more parties.</span>
                </span>
            </div>
        </div>
        
        <!-- Content of page -->
        <div class="flex flex-col justify-start items-start">
            <div class="flex flex-row justify-between items-center mb-4 w-full">
                <div class="relative w-96 mt-4">
                    <span class="absolute inset-y-0 left-3 flex items-center">
                        <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                    </span>
                    <Input 
                        v-model="searchTransaction"
                        placeholder="Search"
                        class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    />
                </div>

                <div class="flex gap-2">
                    <Button variant="outline"
                        class="text-sm font-semibold"
                        @click="handleViewAll">
                        View all
                    </Button>
                    <Button variant="outline"
                        class="text-sm font-semibold"
                        @click="handleToggleFilters">
                        <Icon icon="heroicons:funnel" class="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>
                
            </div>
            <DynamicTable 
                class="w-full"
                :columns="columns" 
                :data="data" 
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disable-toolbar="true"
            >
                
            </DynamicTable>
        </div>

        <TransactionFilterDialog
            :isOpen="transactionFilterDialogData.isOpen"
            :isLoading="transactionFilterDialogData.isLoading"
            :filter="transactionFilterDialogData.filter"
            @submit="handleFilterSubmit"
            @cancel="transactionFilterDialogData.isOpen = false"
        />
    </div>
</template>