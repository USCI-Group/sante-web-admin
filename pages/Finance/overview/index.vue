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
import type { GetFullReportResponse, FullReport, OverviewPerformance, SalesByProduct } from '~/types/finance'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import Tooltip from '~/components/custom/Tooltip.vue'
import ProductSoldByPaymentMethodDialog from '~/components/custom/finance/ProductSoldByPaymentMethodDialog.vue'

const { getOverviewPerformance } = useFinances()
const { getOutletsOptions, getOutletGroupsByUserId } = useOutlets()
const { toast } = useToast()
const { getMe, me } = useUsers()
const router = useRouter()
const isLoading = ref(false)

const outletOptions = ref<Option[]>([])
const data = ref<GetFullReportResponse>()
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const isProductSoldByPaymentMethodDialog = ref<{
    open: boolean,
    paymentMethod: string[],
}>({
    open: false,
    paymentMethod: [],
})

const outletId = ref<string>('All Outlets')
const dateType = ref<string>('Daily')
const dateRange = ref<Date[]>([new Date(), new Date()])
const overviewPerformance = ref<OverviewPerformance>()
// Generate random colors for charts
const generateRandomColors = (count: number) => {
    const colors = []
    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 100) + 100 // Lower base for less bright colors
        const g = Math.floor(Math.random() * 100) + 100
        const b = Math.floor(Math.random() * 100) + 100
        colors.push(`rgb(${r}, ${g}, ${b})`)
    }
    return colors
}

const colors = ref<string[]>(generateRandomColors(100))
const colors2 = ref<string[]>(generateRandomColors(100))
const colors3 = ref<string[]>(generateRandomColors(100))
const colors4 = ref<string[]>(generateRandomColors(100))
const colors5 = ref<string[]>(generateRandomColors(100))
const color_grey = ref<string[]>(['#d3d3d3'])

type ChartOptions = {
    series: number[],
    labels: string[],
    colors: string[],
    legend: {
        show: boolean,
    }
    dataLabels: {
        enabled: boolean
        formatter?: (val: number) => string
    },
    plotOptions: {
        pie: {
            size?: number,
            donut: {
                size?: string
            }
        }
    },
}

const chartOptionsPreset = ref<ChartOptions>({
    series: [1],
    labels: ["No Products Sold"],
    colors: colors.value,
    legend: {
        show: false,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        const total = 100; // You can set this to the total value you want;
        return (val / total * 100).toFixed(2) + '%';
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%'
        }
      }
    },
})

const chartOptionsProduct = ref<ChartOptions>(chartOptionsPreset.value)
const chartOptionsProductGrab = ref<ChartOptions>(chartOptionsPreset.value)
const chartOptionsProductShopee = ref<ChartOptions>(chartOptionsPreset.value)
const chartOptionsPaymentMethod = ref<ChartOptions>(chartOptionsPreset.value)
const chartOptionsModifier = ref<ChartOptions>(chartOptionsPreset.value)

const chartOptionsHourly = ref({
    series: [{
        name: 'Hourly Sales',
        data: [0,0]
    }],
    chart: {
        id: 'Hourly_Sales_Overview',
        type: 'area'
    },
    colors: ['#00A859'],
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    xaxis: {
        type: 'string',
        categories: ["9:00 AM", "6:00 PM"]
    },
    yaxis: {
        tickAmount: 4,
    },
    tooltip: {
        y: {
            formatter: function(val: number) {
                return 'RM ' + val.toFixed(2);
            }
        }
    },
})

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

const openProductSoldByPaymentMethodDialog = () => {
    isProductSoldByPaymentMethodDialog.value.open = true
    const paymentMethod = new Set<string>()
    overviewPerformance.value?.sales_by_product_outlet.forEach((item: SalesByProduct) => {   
        if (item.sold_by_payment_method){
            Object.keys(item.sold_by_payment_method).forEach((key: string) => {
                paymentMethod.add(key)
            })
        }
    })
    isProductSoldByPaymentMethodDialog.value.paymentMethod = Array.from(paymentMethod)
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

        if(dateRange.value.length > 0){
            filter.start_date = dateRange.value[0].toISOString()
            filter.end_date = dateRange.value[1].toISOString()
        }

        if(outletId.value.includes('-area')){
            filter.outlet_group_id = outletId.value.replace('-area', '')
            delete filter.outlet_id
        }

        // const response = await getFullReports(filter)
        const overviewResponse = await getOverviewPerformance(filter)
        overviewPerformance.value = overviewResponse
        
        const isPaymentMethodEmpty = overviewResponse.sales_by_payment_method.every(item => item.total_sales === 0)
        const isModifierEmpty = overviewResponse.sales_by_modifier ? overviewResponse.sales_by_modifier.every(item => item.quantity_sold === 0) : true
        const isProductEmpty = overviewResponse.sales_by_product_outlet ? overviewResponse.sales_by_product_outlet.every(item => item.quantity_sold === 0) : true
        const isProductGrabEmpty = overviewResponse.sales_by_product_grab ? overviewResponse.sales_by_product_grab.every(item => item.quantity_sold === 0) : true
        const isProductShopeeEmpty = overviewResponse.sales_by_product_shopee ? overviewResponse.sales_by_product_shopee.every(item => item.quantity_sold === 0) : true

        if(isPaymentMethodEmpty){
            chartOptionsPaymentMethod.value = {
                ...chartOptionsPaymentMethod.value,
                colors: color_grey.value,
                series: [1],
                labels: ["No Data"],
                dataLabels: {
                    enabled: false
                },
            }
        }else{
            chartOptionsPaymentMethod.value = {
                ...chartOptionsPaymentMethod.value,
                colors: colors2.value,
                series: overviewResponse.sales_by_payment_method.map((item) => item.total_sales),
                labels: overviewResponse.sales_by_payment_method.map((item) => item.payment_method),
                dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                        const total = 100;
                        return (val / total * 100).toFixed(2) + '%';
                    }
                },
            }
        }

        if(isModifierEmpty){
            chartOptionsModifier.value = {
                ...chartOptionsModifier.value,
                colors: color_grey.value,
                series: [1],
                labels: ["No Data"],
                dataLabels: {
                    enabled: false
                },
            }
        }else{
            chartOptionsModifier.value = {
                ...chartOptionsModifier.value,
                colors: colors3.value,
                series: overviewResponse.sales_by_modifier.map((item) => item.quantity_sold),
                labels: overviewResponse.sales_by_modifier.map((item) => item.modifier_options.name),
                dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                        const total = 100;
                        return (val / total * 100).toFixed(2) + '%';
                    }
                },
            }
        }

        if(isProductEmpty){
            chartOptionsProduct.value = {
                ...chartOptionsProduct.value,
                colors: color_grey.value,
                series: [1],
                labels: ["No Data"],
                dataLabels: {
                    enabled: false
                },
            }
        }else{
            chartOptionsProduct.value = {
                ...chartOptionsProduct.value,
                colors: colors.value,
                series: overviewResponse.sales_by_product_outlet.map((item) => item.quantity_sold),
                labels: overviewResponse.sales_by_product_outlet.map((item) => item.product.name),
                dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                        const total = 100;
                        return (val / total * 100).toFixed(2) + '%';
                    }
                },
            }
        }

        if(isProductGrabEmpty){
            chartOptionsProductGrab.value = {
                ...chartOptionsProductGrab.value,
                colors: color_grey.value,
                series: [1],
                labels: ["No Data"],
                dataLabels: {
                    enabled: false
                },
            }
        }else{
            chartOptionsProductGrab.value = {
                ...chartOptionsProductGrab.value,
                colors: colors4.value,
                series: overviewResponse.sales_by_product_grab.map((item) => item.quantity_sold),
                labels: overviewResponse.sales_by_product_grab.map((item) => item.product.name),
                dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                        const total = 100;
                        return (val / total * 100).toFixed(2) + '%';
                    }
                },
            }
        }

        if(isProductShopeeEmpty){
            chartOptionsProductShopee.value = {
                ...chartOptionsProductShopee.value,
                colors: color_grey.value,
                series: [1],
                labels: ["No Data"],
                dataLabels: {
                    enabled: false
                },
            }
        }else{
            chartOptionsProductShopee.value = {
                ...chartOptionsProductShopee.value,
                colors: colors5.value,
                series: overviewResponse.sales_by_product_shopee.map((item) => item.quantity_sold),
                labels: overviewResponse.sales_by_product_shopee.map((item) => item.product.name),
                dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                        const total = 100;
                        return (val / total * 100).toFixed(2) + '%';
                    }
                },
            }
        }

        if(overviewResponse.hourly_sales_performance.total_sales > 0){
            chartOptionsHourly.value = {
                ...chartOptionsHourly.value,
                series: [{
                    name: 'Hourly Sales',
                    data: overviewResponse.hourly_sales_performance.hourly_sales.map((item) => item.total_sales)
                }],
                xaxis: {
                    type: 'datetime',
                    categories: overviewResponse.hourly_sales_performance.hourly_sales.map((item) => item.time)
                }
            }
        }
        else{
            chartOptionsHourly.value = {
                ...chartOptionsHourly.value,
                series: [{
                    name: 'Hourly Sales',
                    data: [0,0,0,0,0,0,0,0,0,0,0]
                }],
                xaxis: {
                    type: 'datetime',
                    categories: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"]
                }
            }
        }

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

watch(outletId, async () => {
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
                            <Icon icon="heroicons:chart-bar" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Overview</p>
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
                    <h1 class="text-2xl font-bold">Overview</h1>
                    <span class="text-sm text-gray-500">A comprehensive snapshot of your organization’s financial performance.</span>
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

        <div class="flex flex-row gap-4">
            <div class="border rounded-lg mt-4 w-1/2">
                <div class="flex flex-col">
                    <div class="p-4">
                        Sales By Payment Method
                    </div>
                    <hr class="py-2">
                    <div class="flex flex-row justify-center">
                        <div v-if="chartOptionsPaymentMethod.labels.includes('No Data')" class="absolute text-center mt-10 pt-10">
                            <p class="text-gray-400 text-sm mt-3">No Data</p>
                        </div>
                        <apexchart width="80%" type="donut" :options="chartOptionsPaymentMethod" :series="chartOptionsPaymentMethod.series">
                        </apexchart>
                    </div>
                    <div class="flex flex-col py-5">
                        <div v-for="(item, index) in overviewPerformance?.sales_by_payment_method" :key="item.payment_method">
                            <div v-if="item.total_sales > 0" class="flex items-center justify-between px-4 pb-1 text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index] }"></span>
                                    <span class="text-gray-600 capitalize">
                                        {{ item.payment_method.replace(/_/g, " ") }}
                                    </span>
                                    <Icon v-if="['CASH', 'CASHLESS'].includes(item.payment_method)" icon="simple-icons:grab" class="w-8 h-8" />
                                </div>
                                <span class="text-gray-600">RM {{ item.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border rounded-lg mt-4 w-1/2">
                <div class="flex flex-col">
                    <div class="p-4">
                        Sales By Modifier
                    </div>
                    <hr class="py-2">
                    <div class="flex flex-row justify-center">
                        <div v-if="chartOptionsModifier.labels.includes('No Data')" class="absolute text-center mt-10 pt-10">
                            <p class="text-gray-400 text-sm mt-3">No Data</p>
                        </div>
                        <apexchart width="80%" type="donut" :options="chartOptionsModifier" :series="chartOptionsModifier.series"></apexchart>
                    </div>
                    <div class="flex flex-col py-5">
                        <div v-for="(item, index) in overviewPerformance?.sales_by_modifier" :key="item.modifier_options.id">
                            <div v-if="item.quantity_sold > 0" class="flex items-center justify-between px-4 pb-1 text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index] }"></span>
                                    <span class="text-gray-600">
                                        {{ item.modifier_options.name }}
                                    </span>
                                </div>
                                <span class="text-gray-600">{{ item.quantity_sold.toLocaleString() }} Modifiers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div class="flex flex-row gap-4">
            <div class="border rounded-lg mt-4 w-1/2">
                <div class="flex flex-col">
                    <div class="p-4 cursor-pointer" @click="openProductSoldByPaymentMethodDialog">
                        <Tooltip text="Click to view details" position="top">
                            <Icon icon="mdi:table" class="w-5 h-5 mr-2 inline-block align-middle text-primary" />
                            Sales By Product (Store Outlet)
                        </Tooltip>
                    </div>
                    <hr class="py-2">
                    <div class="flex flex-row justify-center">
                        <div v-if="chartOptionsProduct.labels.includes('No Data')" class="absolute text-center mt-10 pt-10">
                            <p class="text-gray-400 text-sm mt-3">No Data</p>
                        </div>
                        <apexchart width="80%" type="donut" :options="chartOptionsProduct" :series="chartOptionsProduct.series"></apexchart>
                    </div>
                    <div class="flex flex-col py-5" @click="openProductSoldByPaymentMethodDialog">
                        <div v-for="(item, index) in overviewPerformance?.sales_by_product_outlet" :key="item.product.id">
                            <div v-if="item.quantity_sold > 0" class="flex items-center justify-between px-4 pb-1 text-sm cursor-pointer" @click="()=>{console.log('test')}">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index] }"></span>
                                    <span class="text-gray-600">
                                        {{ item.product.name }}
                                    </span>
                                </div>
                                <span class="text-gray-600">{{ item.quantity_sold.toLocaleString() }} Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border rounded-lg mt-4 w-1/2">
                <div class="flex flex-col">
                    <div class="p-4">
                        Sales By Product (Grab)
                    </div>
                    <hr class="py-2">
                    <div class="flex flex-row justify-center">
                        <div v-if="chartOptionsProductGrab.labels.includes('No Data')" class="absolute text-center mt-10 pt-10">
                            <p class="text-gray-400 text-sm mt-3">No Data</p>
                        </div>
                        <apexchart width="80%" type="donut" :options="chartOptionsProductGrab" :series="chartOptionsProductGrab.series"></apexchart>
                    </div>
                    <div class="flex flex-col py-5">
                        <div v-for="(item, index) in overviewPerformance?.sales_by_product_grab" :key="item.product.id">
                            <div v-if="item.quantity_sold > 0" class="flex items-center justify-between px-4 pb-1 text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index] }"></span>
                                    <span class="text-gray-600">
                                        {{ item.product.name }}
                                    </span>
                                </div>
                                <span class="text-gray-600">{{ item.quantity_sold.toLocaleString() }} Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border rounded-lg mt-4 w-1/2">
                <div class="flex flex-col">
                    <div class="p-4">
                        Sales By Product (Shopee)
                    </div>
                    <hr class="py-2">
                    <div class="flex flex-row justify-center">
                        <div v-if="chartOptionsProductShopee.labels.includes('No Data')" class="absolute text-center mt-10 pt-10">
                            <p class="text-gray-400 text-sm mt-3">No Data</p>
                        </div>
                        <apexchart width="80%" type="donut" :options="chartOptionsProductShopee" :series="chartOptionsProductShopee.series"></apexchart>
                    </div>
                    <div class="flex flex-col py-5">
                        <div v-for="(item, index) in overviewPerformance?.sales_by_product_shopee" :key="item.product.id">
                            <div v-if="item.quantity_sold > 0" class="flex items-center justify-between px-4 pb-1 text-sm">
                                <div class="flex items-center gap-2">
                                    <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: colors[index] }"></span>
                                    <span class="text-gray-600">
                                        {{ item.product.name }}
                                    </span>
                                </div>
                                <span class="text-gray-600">{{ item.quantity_sold.toLocaleString() }} Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-row mb-4">
            <div class="border rounded-lg mt-4 w-full">
                <div class="flex flex-col">
                    <div class="p-4">
                        <div class="flex flex-row justify-between">
                            <div>
                                Hourly Sales
                            </div>
                            <div>
                                <span class="text-gray-400 text-sm">Current Sales</span>
                                <span class="ml-2 text-[#00A859] text-lg font-medium">
                                    RM {{ overviewPerformance?.hourly_sales_performance.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr class="py-2">
                    <apexchart height="500px" type="area" :options="chartOptionsHourly" :series="chartOptionsHourly.series"></apexchart>
                </div>
            </div>
        </div>

        <ProductSoldByPaymentMethodDialog
            :open="isProductSoldByPaymentMethodDialog.open"
            :salesByProduct="overviewPerformance?.sales_by_product_outlet || []"
            :paymentMethod="isProductSoldByPaymentMethodDialog.paymentMethod"
            @close="isProductSoldByPaymentMethodDialog.open = false"
        />

    </div>
</template>