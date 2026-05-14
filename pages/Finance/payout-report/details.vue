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
import type { ExpensesOutlet } from '~/types/finance'
const { getPayoutReportDetails } = useFinances()
const { toast } = useToast()


const expenseOutlet = ref<ExpensesOutlet>({} as ExpensesOutlet)
const order_id = ref<string>()

onMounted(async () => {
    order_id.value = useRoute().query.id as string
    try {
        await loadData()
    } catch (error: any) {
        toast({
            title: 'Error',
            description: "Failed to fetch menu products",
            variant: 'destructive'
        })
    }
})

const loadData = async () => {
    const response = await getPayoutReportDetails(order_id.value ?? '')
    expenseOutlet.value = response || {} as ExpensesOutlet
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
                        <NuxtLink to="/finance/payout-report" class="flex px-2.5 py-[5px] h-[34px] w-fit rounded-md justify-center items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Icon icon="heroicons:document-text" class="w-6 h-6" />
                            <p class="text-sm">Payout Report</p>
                        </NuxtLink>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-fit bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <p class="text-white text-sm">Payout Report Details</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <!-- Header title of page -->
         <div>
            <!-- <div class="text-primary p-2">Payout Report Details</div> -->
            <div class="flex flex-row items-center justify-between">
                <div class="p-4 w-full bg-white rounded-xl border border-[#E5E5E5]">
                    <div class="w-full h-full flex-col p-5"> 
                        <p class="text-2xl text-[#181D27] leading-loose">
                            Payout Details
                        </p>

                        <hr>
                        <div class="w-full h-full flex flex-col mt-4">
                            <div class="my-3">
                                <p class="mb-1">
                                    Expenses Category
                                </p>
                                <p class="text-gray-500">
                                    • {{ expenseOutlet.expenses_category }}
                                </p>
                            </div>
                            <div class="my-3">
                                <p class="mb-1">
                                    Date
                                </p>
                                <p class="text-gray-500">
                                    • {{ new Date(expenseOutlet.expenses_date).toLocaleString('en-MY', { 
                                        day: '2-digit', 
                                        month: '2-digit', 
                                        year: 'numeric', 
                                        timeZone: 'Asia/Kuala_Lumpur' 
                                    }) }}
                                </p>
                            </div>

                            <div class="my-3">
                                <p class="mb-1">
                                    Price
                                </p>
                                <p class="text-gray-500">
                                    • RM {{ Number(expenseOutlet.expenses_amount).toFixed(2) }}
                                </p>
                            </div>

                            <div class="my-3">  
                                <p class="mb-1">
                                    Remarks
                                </p>
                                <p class="text-gray-500">
                                    • {{ expenseOutlet.expenses_description }}
                                </p>
                            </div>
                            
                            <div class="my-3">
                                <p class="mb-1">
                                    Receipt
                                </p>
                                <div v-if="expenseOutlet.expenses_attachment_url" class="flex w-1/3 items-center gap-2 p-3 border border-gray-200 rounded-md">
                                    <Icon icon="heroicons:document" class="w-6 h-6 text-gray-500" />
                                    <span class="text-sm text-gray-600 truncate flex-1">
                                        {{ expenseOutlet.expenses_attachment_url.split('/').pop() }}
                                    </span>
                                    <a @click="downloadFromS3(expenseOutlet.expenses_attachment_url)" class="text-[#00A859] hover:text-[#008C4A] transition-colors cursor-pointer">
                                        <Icon icon="heroicons:arrow-down-tray" class="w-5 h-5" />
                                    </a>
                                </div>
                                <p v-else class="text-gray-500">No attachment</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
    </div>
</template>