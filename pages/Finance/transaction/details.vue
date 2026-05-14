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
import DynamicDialog from '@/components/custom/DynamicDialog.vue'

import type { SelectOption } from '@/types/common'
import type { FinanceTransaction } from '~/types/finance'
import { PaymentMethod } from '@/constants/payment'
const { getTransactionDetails, voidReceipt } = useFinances()
const { toast } = useToast()
const deleteForm = ref({
    isDialogOpen: false,
    title: 'Void Receipt',
    description: 'Are you sure you want to void this receipt?',
    confirmationText: 'Void Receipt',
    showConfirmationInput: true,
})

const financeTransaction = ref<FinanceTransaction>({} as FinanceTransaction)
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
    const response = await getTransactionDetails(order_id.value ?? '')
    financeTransaction.value = response || {} as FinanceTransaction
}

const triggerVoidReceiptDialog = () => {
    deleteForm.value.isDialogOpen = true
    deleteForm.value.confirmationText = 'Void Receipt ' + financeTransaction.value.receipt_no
}

const handleVoidReceipt = async (confirmation: string | undefined) => {
    if (confirmation != deleteForm.value.confirmationText) {
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }

    try {
        deleteForm.value.isDialogOpen = false
        await voidReceipt(order_id.value ?? '')
        toast({
            title: 'Success',
            description: 'Receipt voided successfully',
            variant: 'success',
        })
        await loadData()
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to void receipt',
            variant: 'destructive',
        })
    }
}
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
                        <NuxtLink to="/finance/transaction" class="flex px-2.5 py-[5px] h-[34px] w-fit rounded-md justify-center items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Icon icon="heroicons:banknotes" class="w-6 h-6" />
                            <p class="text-sm">Transaction</p>
                        </NuxtLink>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-fit bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:banknotes" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Transaction Details</p>
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
                    <h1 class="text-2xl font-bold">Transaction Details</h1>
                    <span class="text-sm text-gray-500">View the details of a specific transaction.</span>
                </span>
            </div>
        </div>

        <div class="flex justify-end items-center">
            <Button 
                variant="destructive" 
                class="btn-primary"
                @click="triggerVoidReceiptDialog"
                :disabled="financeTransaction.status === 'cancelled'"
            >
                <Icon icon="heroicons:trash" class="w-4 h-4 mr-2" />
                Void Receipt
            </Button>
        </div>
        
         <div v-for="(item_details, index) in financeTransaction.item_details" :key="item_details.product_id">
            <div class="text-primary p-2">Item {{ index + 1 }}</div>
            <div class="flex flex-row items-center gap-4 justify-between">
                <div class="p-4 grid grid-cols-[2fr_3fr] gap-6 w-full bg-white rounded-xl border border-[#E5E5E5]">
                    <!-- Receipt Image -->
                    <div class="w-full bg-[#FAFAFA] flex justify-center items-center p-4">
                        <img :src="item_details.image_url" class="w-full object-cover rounded-xl max-h-[300px]" />
                    </div>
                    <!-- Transaction Information -->
                    <div class="w-full h-full flex-col"> 
                        <!-- header of transaction details -->
                        <div class="w-full max-h-[100px] grid grid-cols-[9fr_1fr]">
                            <div class="w-full h-full grid grid-rows-[2fr_1fr]">
                                <!-- Receipt Number -->
                                <div class="w-full flex justify-start items-center">
                                    <p class="text-2xl font-medium text-[#181D27] leading-loose">
                                        {{ item_details.product_name }}
                                    </p>
                                </div>
                            </div>
                            <!-- <div class="w-full h-full flex justify-end items-top">
                                <Button class="w-[20px] h-[30px] bg-[#FFF4ED] rounded-md">
                                    <Icon icon="heroicons:printer" class="w-4 h-4 text-[#FF4405]" />
                                </Button>
                            </div> -->
                        </div>

                        <div class="w-full h-full flex flex-col">
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="mb-1">
                                        Receipt No.
                                    </p>
                                    <p class="text-gray-500">
                                        {{ financeTransaction.receipt_no }}
                                    </p>
                                </div>
                                <div>
                                    <p class="mb-1">
                                        Purchase Date
                                    </p>
                                    <p class="text-gray-500">
                                        {{ new Date(financeTransaction.transaction_date).toLocaleString('en-MY', { 
                                            day: '2-digit', 
                                            month: '2-digit', 
                                            year: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit', 
                                            second: '2-digit', 
                                            hour12: true, 
                                            timeZone: 'Asia/Kuala_Lumpur' 
                                        }) }}
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="mb-1">
                                        Quantity
                                    </p>
                                    <p class="text-gray-500">
                                        {{ item_details.quantity }}
                                    </p>
                                </div>
                                <div>
                                    <p class="mb-1">
                                        Total Price
                                    </p>
                                    <p class="text-gray-500">
                                        RM {{ item_details.price.toFixed(2) }}
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="mb-1">
                                        Payment Method
                                    </p>
                                    <p class="text-gray-500">
                                        <Badge variant="outline" class="capitalize px-4 py-1" :class="{
                                          'bg-gray-300 text-gray-800': financeTransaction.payment_method === PaymentMethod.FPX,
                                          'bg-blue-300 text-blue-800': financeTransaction.payment_method === PaymentMethod.EWallet,
                                          'bg-green-300 text-green-800': financeTransaction.payment_method === PaymentMethod.Cash,
                                          'bg-[#FFD26D] text-[#966D11]': financeTransaction.payment_method === PaymentMethod.BNPL,
                                          'bg-yellow-300 text-yellow-800': financeTransaction.payment_method === PaymentMethod.CreditCard || financeTransaction.payment_method === PaymentMethod.DebitCard,
                                        }">{{ financeTransaction.payment_method }}</Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>

         <DynamicDialog
            :isOpen="deleteForm.isDialogOpen"
            :title="deleteForm.title"
            :description="deleteForm.description"
            :confirmationText="deleteForm.confirmationText"
            :showConfirmationInput="deleteForm.showConfirmationInput"
            @cancel="deleteForm.isDialogOpen = false"
            @confirm="handleVoidReceipt"
        />
    </div>
</template>