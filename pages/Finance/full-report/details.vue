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
import { Icon } from '@iconify/vue'
import type { FinanceSummary } from '~/types/finance'
import type { Outlet } from '~/types/outlet'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
const { getOutlet } = useOutlets()
const { getFullReportSummaryDetails  } = useFinances()
const { toast } = useToast()

const outlet = ref<Outlet>({} as Outlet)
const fullReportSummaryDetails = ref<FinanceSummary>({} as FinanceSummary)

const outlet_id = ref<string>()
const start_date = ref<string>()
const end_date = ref<string>()

onMounted(async () => {
    outlet_id.value = useRoute().query.id as string
    start_date.value = useRoute().query.start_date as string
    end_date.value = useRoute().query.end_date as string

    await loadData()
})

const loadData = async () => {
    await loadFullReportSummaryDetails()
    await loadOutlet()
}

const loadOutlet = async () => {
    const res = await getOutlet(outlet_id.value ?? '')
    outlet.value = res
}

const loadFullReportSummaryDetails = async () => {
    try{
        if (!start_date.value || !end_date.value) {
            toast({
                title: 'Error',
                description: "Start date and end date are required",
                variant: 'destructive'
            })
            return
        }
    
        const startDate = new Date(start_date.value)
        const endDate = new Date(end_date.value)       
        const response = await getFullReportSummaryDetails(
            outlet_id.value ?? '', 
            startDate.toISOString(), 
            endDate.toISOString()
        )
        fullReportSummaryDetails.value = response
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }
}

const formatDateRange = () => {
    const start = new Date(start_date.value ?? '')
    const end = new Date(end_date.value ?? '')
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
}

const section1 = ref(null as any)
const section2 = ref(null as any)
const section3 = ref(null as any)
const section4 = ref(null as any)
const section5 = ref(null as any)

const generatePDF = async (action: 'download' | 'print') => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const marginLeft = 10
  const marginTop = 5
  const marginBottom = 5
  const usablePageHeight = pageHeight - marginTop - marginBottom
  const imgWidth = pageWidth - marginLeft * 2

  const sections = [section1.value, section2.value, section3.value, section4.value, section5.value]

  let currentY = marginTop

  for (let i = 0; i < sections.length; i++) {
    const canvas = await html2canvas(sections[i], {
      scale: 2,
      ignoreElements: (el) => el.classList.contains('no-print'),
    })

    const imgData = canvas.toDataURL('image/jpeg', 1)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Check if section fits on the current page
    if (currentY + imgHeight > pageHeight - marginBottom) {
      pdf.addPage()
      currentY = marginTop
    }

    pdf.addImage(imgData, 'JPEG', marginLeft, currentY, imgWidth, imgHeight)
    currentY += imgHeight + 5 // add 5mm space between sections
  }

    if (action === 'download') {
        pdf.save('full-report-details.pdf')
    } else {
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
    }
}


</script>

<style scoped></style>

<template>
    <div class="w-full h-full p-6">
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
                        <NuxtLink to="/finance/full-report" class="flex px-2.5 py-[5px] h-[34px] w-fit rounded-md justify-center items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Icon icon="heroicons:document-chart-bar" class="w-6 h-6" />
                            <p class="text-sm">Full Report</p>
                        </NuxtLink>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-fit bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <p class="text-white text-sm">Full Report Details</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <hr>
        <!-- Header title of page -->
        <div class="flex flex-row items-center my-4 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-2xl">Report Details</h1>
                    <span class="text-sm text-gray-500">A comprehensive breakdown of the data collected in a specific report.</span>
                </span>
            </div>
        </div>

         <div>
            <!-- <div class="text-primary p-2">Payout Report Details</div> -->
            <div class="flex flex-row items-center justify-between">
                <div class="p-4 w-full bg-white rounded-xl border border-[#E5E5E5]">
                    <div class="flex flex-row items-center justify-between no-print"> 
                        <div class="w-16 h-16 rounded-lg overflow-hidden">
                            <img 
                                v-if="outlet?.image_url"
                                :src="outlet?.image_url" 
                                alt="Outlet Image"
                                class="w-full h-full object-cover"
                            />
                            <Icon 
                                v-else 
                                icon="heroicons:building-storefront" 
                                class="w-16 h-16 text-gray-400"
                            />
                        </div>

                        <div>
                            <div class="flex gap-2">
                                <Button @click="generatePDF('print')" variant="outline" class="flex items-center gap-2">
                                    <Icon icon="heroicons:printer" class="w-5 h-5" />
                                    Print
                                </Button>
                                <Button @click="generatePDF('download')" variant="outline" class="btn-primary px-3 py-2 rounded-lg">
                                    <Icon icon="heroicons:arrow-down-tray" class="w-5 h-5" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                    <hr class="my-3">
                    <div ref="section1">
                        <div>
                            <p class="font-semibold">{{ outlet?.name }}</p>
                            <div class="flex flex-col">
                                <p class="font-semibold">{{ outlet?.address?.street_line1 }}, {{ outlet?.address?.street_line2 }}, {{ outlet?.address?.street_line3 }}</p>
                                <p class="font-semibold">{{ outlet?.address?.city }},</p>
                                <p class="font-semibold">{{ outlet?.address?.postal_code }} {{ outlet?.address?.state }},</p>
                                <p class="font-semibold">{{ outlet?.address?.country }}</p>
                            </div>
                        </div>

                        <div class="mt-5">
                            <div class="flex justify-center">Z Report</div>
                            <div class="mt-4">
                                <div class="grid grid-cols-[1fr_4fr] border-t border-r border-l">
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Reported Date</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ formatDateRange() }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Sales Person</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sales Info -->
                        <div class="mt-5">
                            <div class="flex justify-center">Outlet Report</div>
                            <div class="mt-4">
                                <div class="grid grid-cols-[1fr_4fr] border-t border-r border-l">
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Gross Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.gross_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Discount</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_discount?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Service Charge</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_service_charge?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Tax</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_tax?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Net Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_net_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Redeem Points</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_redeem_points?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Cash Rounding</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_cash_rounding?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Sales</span>
                                    </div>  
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Cost</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_cost?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Gross Profit</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.gross_profit?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Net Profit</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.net_profit?.toFixed(2) }}</span>
                                    </div>

                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Cash Closing</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.cash_closing?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">No. of Sales Transaction</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.no_of_sales_trans }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Average Sales per Transaction</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.average_sales_per_trans?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">No. of Voided Transaction</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.no_of_voided_trans }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Voided Amount</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.total_voided_amount?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Total Customer Sign Up Membership</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.total_customer_sign_up_membership }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Member Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.member_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Member Sales Quantity</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.member_sales_quantity }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Non-Member Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.non_member_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Non-Member Sales Quantity</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.non_member_sales_quantity }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Unpaid Orders</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">{{ fullReportSummaryDetails?.sales_info?.unpaid_orders }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Cash Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.cash_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Duitnow QR Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.duitnow_qr_sales?.toFixed(2) }}</span>
                                    </div>
    
                                    <div class="flex flex-col p-4 border-b border-r">
                                        <span class="text-sm">Card Sales</span>
                                    </div>
                                    <div class="flex flex-col p-4 border-b">
                                        <span class="text-sm">RM {{ fullReportSummaryDetails?.sales_info?.card_sales?.toFixed(2) }}</span>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sales By Category -->
                    <div ref="section2" class="mt-5">
                        <div class="flex justify-center">Sales By Category</div>
                        <div class="mt-4 border-t border-r border-l">
                            <div v-for="sale_by_category in fullReportSummaryDetails?.sales_by_category" class="grid grid-cols-[1fr_4fr]">
                                <div class="flex flex-col p-4 border-b border-r">
                                    <span class="text-sm">{{ sale_by_category?.product_category?.name }}</span>
                                </div>
                                <div class="flex flex-col p-4 border-b">
                                    <span class="text-sm">RM {{ sale_by_category?.gross_sales?.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales By Product -->
                    <div ref="section3" class="mt-5">
                        <div class="flex justify-center">Sales By Product</div>
                        <div class="mt-4 border-t border-r border-l">
                            <div v-for="sale_by_product in fullReportSummaryDetails?.sales_by_product" class="grid grid-cols-[1fr_4fr]">
                                <div class="flex flex-col p-4 border-b border-r">
                                    <span class="text-sm">{{ sale_by_product?.product?.name }}</span>
                                </div>
                                <div class="flex flex-col p-4 border-b">
                                    <span class="text-sm">RM {{ sale_by_product?.gross_sales?.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales By Modifier -->
                    <div ref="section4" class="mt-5">
                        <div class="flex justify-center">Sales By Modifier</div>
                        <div class="mt-4 border-t border-r border-l">
                            <div v-for="sale_by_modifier in fullReportSummaryDetails?.sales_by_modifier_options" class="grid grid-cols-[1fr_4fr]">
                                <div class="flex flex-col p-4 border-b border-r">
                                    <span class="text-sm">{{ sale_by_modifier?.modifier_options?.name }}</span>
                                </div>
                                <div class="flex flex-col p-4 border-b">
                                    <span class="text-sm">RM {{ sale_by_modifier?.gross_sales?.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales By Employee -->
                    <div ref="section5" class="mt-5">
                        <div class="flex justify-center">Sales By Employee</div>
                        <div class="mt-4 border-t border-r border-l">
                            <div v-for="sale_by_employee in fullReportSummaryDetails?.sales_by_employee" class="grid grid-cols-[1fr_4fr]">
                                <div class="flex flex-col p-4 border-b border-r">
                                    <span class="text-sm">{{ sale_by_employee?.employee?.first_name }} {{ sale_by_employee?.employee?.surname }}</span>
                                </div>
                                <div class="flex flex-col p-4 border-b">
                                    <span class="text-sm">RM {{ sale_by_employee?.total_net_sales?.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
         </div>
    </div>
</template>