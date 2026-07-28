<script setup lang="ts">
definePageMeta({ auth: false, layout: false })

import { reactive, ref } from 'vue'
import { MalaysianStates } from '@/constants/states'
import { useUserOrders } from '@/composables/userOrders'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Order } from '@/types/orders'
const { submitEInvoiceByOrder, getOrderById } = useUserOrders()
const { toast } = useToast()

const buyerForm = reactive({
  buyer_name: '',
  buyer_brn: '',
  buyer_brn_scheme_id: '',
  buyer_address_line_1: '',
  buyer_address_line_2: '',
  buyer_address_line_3: '',
  buyer_city: '',
  buyer_postal_code: '',
  buyer_country_subentity_code: '',
  buyer_telephone: '',
  buyer_email: '',
})

const formErrors = reactive({
  buyer_name: '',
  buyer_brn: '',
  buyer_brn_scheme_id: '',
  buyer_address_line_1: '',
  buyer_city: '',
  buyer_postal_code: '',
  buyer_country_subentity_code: '',
  buyer_telephone: '',
  buyer_email: '',
  general: '',
})

const order_id = ref('')

const submitting = ref(false)
const submitted = ref(false)
const showOrderDetails = ref(false)

const order = ref<Order | null>(null)

onMounted(async () => {
  order_id.value = useRoute().query.order_id as string
  await getOrder()
})

async function getOrder() {
  try {
    var orderData = await getOrderById(order_id.value)
    order.value = orderData
    if (order.value?.e_invoice_status === 'VALID' || order.value?.e_invoice_status === 'SUBMITTED' || order.value?.e_invoice_status === 'QUEUED') {
      showOrderDetails.value = true
    }
  } catch (error) {
  }
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  await submitInvoice()
  submitting.value = false
}

const validateForm = () => {
  if (!order_id.value) {
    toast({
      title: 'Error',
      description: 'Order ID is required',
      variant: 'destructive',
    })
    return false
  }

  formErrors.general = ''
  if (!buyerForm.buyer_name) formErrors.buyer_name = 'Buyer name is required'
  else formErrors.buyer_name = ''

  if (!buyerForm.buyer_brn) formErrors.buyer_brn = 'ID number is required'
  else formErrors.buyer_brn = ''

  if (!buyerForm.buyer_brn_scheme_id) formErrors.buyer_brn_scheme_id = 'ID type is required'
  else formErrors.buyer_brn_scheme_id = ''

  if (!buyerForm.buyer_address_line_1) formErrors.buyer_address_line_1 = 'Address Line 1 is required'
  else formErrors.buyer_address_line_1 = ''

  if (!buyerForm.buyer_city) formErrors.buyer_city = 'City is required'
  else formErrors.buyer_city = ''

  if (!buyerForm.buyer_postal_code) formErrors.buyer_postal_code = 'Postal code is required'
  else formErrors.buyer_postal_code = ''

  if (!buyerForm.buyer_country_subentity_code) formErrors.buyer_country_subentity_code = 'Country subentity code is required'
  else formErrors.buyer_country_subentity_code = ''

  if (!buyerForm.buyer_telephone) formErrors.buyer_telephone = 'Telephone is required'
  else formErrors.buyer_telephone = ''

  if (!buyerForm.buyer_email) formErrors.buyer_email = 'Email is required'
  else formErrors.buyer_email = ''

  return Object.values(formErrors).every(error => error === '')
}

const submitInvoice = async () => {
  try {
    const res = await submitEInvoiceByOrder({
      order_id: order_id.value,
      buyer_data: {
        buyer_name: buyerForm.buyer_name,
        buyer_brn: buyerForm.buyer_brn,
        buyer_brn_scheme_id: buyerForm.buyer_brn_scheme_id,
        buyer_address_line_1: buyerForm.buyer_address_line_1,
        buyer_address_line_2: buyerForm.buyer_address_line_2,
        buyer_address_line_3: buyerForm.buyer_address_line_3,
        buyer_city: buyerForm.buyer_city,
        buyer_postal_code: buyerForm.buyer_postal_code,
        buyer_country_subentity_code: buyerForm.buyer_country_subentity_code,
        buyer_telephone: buyerForm.buyer_telephone,
        buyer_email: buyerForm.buyer_email,
      }
    })

    toast({
      title: 'Success',
      description: 'Invoice submitted successfully',
      variant: 'success',
    })
    submitted.value = true
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to submit invoice',
      variant: 'destructive',
    })
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50/80 via-purple-50/70 to-slate-100/40 flex items-center justify-center relative overflow-hidden p-8">
    <!-- Pattern overlay on top -->
    <div
      class="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
      style="background: url('/images/login/cover-pattern.png') center center / cover no-repeat;"
    ></div>
    <!-- Gradient in background -->
    <div
      class="absolute inset-0 z-0"
      aria-hidden="true"
      style="background: linear-gradient(to right, #00A859, #F3A953);"
    ></div>
    
    <!-- Invoice submission form -->
    <div v-if="!submitted && !showOrderDetails" class="relative z-20 w-full max-w-2xl rounded-3xl bg-white/90 shadow-xl ring-1 ring-blue-100/70 px-2 py-2 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-50/90 via-purple-50/80 to-white/0 absolute inset-0 pointer-events-none rounded-3xl blur-[2px] z-10" />
      <div class="relative z-20">
        <div class="flex flex-col items-center pt-8 pb-4">
          <img
            src="/images/sante_logo.png"
            alt="Logo"
            class="h-14 drop-shadow-2xl mx-auto mb-2 transition-transform duration-300 hover:scale-110"
          />
          <h1 class="text-3xl font-extrabold text-blue-900 tracking-tight drop-shadow-sm mb-2">Invoice Submission</h1>
          <p class="text-gray-600 text-base mb-2 font-medium text-center max-w-md">
            Fill in the buyer information below to claim your <br />e-invoice
          </p>
        </div>
        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 gap-5 px-8 pb-8">
          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">Buyer Name</label>
            <input
              v-model="buyerForm.buyer_name"
              type="text"
              placeholder="e.g. Ahmad Firdaus bin Ali"
              class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm transition-all placeholder-gray-300"
              :class="formErrors.buyer_name ? 'border-red-400 ring-2 ring-red-100' : ''"
            />
            <span v-if="formErrors.buyer_name" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_name }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">ID Type</label>
            <Select v-model="buyerForm.buyer_brn_scheme_id as string"
            class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
            :class="formErrors.buyer_brn_scheme_id ? 'border-red-400 ring-2 ring-red-100' : ''"
            >
              <SelectTrigger>
                  <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NRIC">NRIC</SelectItem>
                <SelectItem value="BRN">BRN</SelectItem>
                <SelectItem value="PASSPORT">PASSPORT</SelectItem>
                <SelectItem value="ARMY">ARMY</SelectItem>
              </SelectContent>
            </Select>
            <span v-if="formErrors.buyer_brn_scheme_id" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_brn_scheme_id }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">ID Number</label>
            <input
              v-model="buyerForm.buyer_brn"
              type="text"
              placeholder="e.g. 900102055123"
              class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
              :class="formErrors.buyer_brn ? 'border-red-400 ring-2 ring-red-100' : ''"
            />
            <span v-if="formErrors.buyer_brn" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_brn }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">Address Line 1</label>
            <input
              v-model="buyerForm.buyer_address_line_1"
              type="text"
              placeholder="e.g. No. 12, Jalan Teknologi 3"
              class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
              :class="formErrors.buyer_address_line_1 ? 'border-red-400 ring-2 ring-red-100' : ''"
            />
            <span v-if="formErrors.buyer_address_line_1" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_address_line_1 }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">Address Line 2 <span class="text-gray-400 text-xs font-normal">(optional)</span></label>
            <input
              v-model="buyerForm.buyer_address_line_2"
              type="text"
              placeholder="e.g. Lorong 2/3A"
              class="rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 px-4 py-2 bg-white/60 shadow-sm placeholder-gray-300 transition-all"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">Address Line 3 <span class="text-gray-400 text-xs font-normal">(optional)</span></label>
            <input
              v-model="buyerForm.buyer_address_line_3"
              type="text"
              placeholder=""
              class="rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 px-4 py-2 bg-white/60 shadow-sm placeholder-gray-300 transition-all"
            />
          </div>

          <div class="flex-1 flex flex-col gap-1">
            <label class="block text-sm font-semibold text-gray-800">City</label>
            <input
              v-model="buyerForm.buyer_city"
              type="text"
              placeholder="e.g. Kuala Lumpur"
              class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
              :class="formErrors.buyer_city ? 'border-red-400 ring-2 ring-red-100' : ''"
            />
            <span v-if="formErrors.buyer_city" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_city }}</span>
          </div>

          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 flex flex-col gap-1">
              <label class="block text-sm font-semibold text-gray-800">State</label>
              <Select v-model="buyerForm.buyer_country_subentity_code" class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
              :class="formErrors.buyer_country_subentity_code ? 'border-red-400 ring-2 ring-red-100' : ''">
                <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="state in MalaysianStates" :key="state.Code" :value="state.Code">
                        {{ state.State }}
                    </SelectItem>
                </SelectContent>
                </Select>
              <span v-if="formErrors.buyer_country_subentity_code" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_country_subentity_code }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <label class="block text-sm font-semibold text-gray-800">Postal Code</label>
              <input
                v-model="buyerForm.buyer_postal_code"
                type="text"
                placeholder="e.g. 57000"
                class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
                :class="formErrors.buyer_postal_code ? 'border-red-400 ring-2 ring-red-100' : ''"
              />
              <span v-if="formErrors.buyer_postal_code" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_postal_code }}</span>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-1 flex flex-col gap-1">
              <label class="block text-sm font-semibold text-gray-800">Telephone</label>
              <input
                v-model="buyerForm.buyer_telephone"
                type="text"
                placeholder="e.g. 60123456789"
                class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
                :class="formErrors.buyer_telephone ? 'border-red-400 ring-2 ring-red-100' : ''"
              />
              <span v-if="formErrors.buyer_telephone" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_telephone }}</span>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <label class="block text-sm font-semibold text-gray-800">Email</label>
              <input
                v-model="buyerForm.buyer_email"
                type="email"
                placeholder="e.g. ahmad.firdaus@example.com"
                class="rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-4 py-2 bg-white/80 shadow-sm placeholder-gray-300 transition-all"
                :class="formErrors.buyer_email ? 'border-red-400 ring-2 ring-red-100' : ''"
              />
              <span v-if="formErrors.buyer_email" class="text-red-500 text-xs mt-0.5">{{ formErrors.buyer_email }}</span>
            </div>
          </div>

          <div v-if="formErrors.general" class="text-red-500 text-sm text-center bg-red-100 border border-red-200 rounded-lg p-2 mt-2 font-semibold shadow-sm">
            {{ formErrors.general }}
          </div>
          <button
            type="submit"
            :disabled="submitting"
            class="mt-3 w-full inline-flex justify-center items-center gap-2 px-6 py-3 font-semibold rounded-xl bg-primary shadow-lg text-white hover:scale-[1.025] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Submit Invoice Details</span>
            <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Success message -->
    <div v-if="submitted" class="relative z-20 w-full max-w-2xl rounded-3xl bg-white/90 shadow-xl ring-1 ring-blue-100/70 px-2 py-2 overflow-hidden">
    <!-- INSERT_YOUR_CODE -->
    <div class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="bg-gradient-to-tr from-blue-100 via-purple-100 to-green-50 p-1 rounded-2xl shadow-lg w-full max-w-md">
        <div class="bg-white rounded-2xl p-8 flex flex-col items-center text-center gap-4">
          <div class="bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 rounded-full p-3 shadow-lg mb-2 animate-bounce-slow">
            <svg class="h-12 w-12 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" class="stroke-current opacity-20" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M8 13l3 3 5-5" class="stroke-current" />
            </svg>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-blue-800">Invoice Successfully Submitted!</h2>
          <p class="text-base text-gray-600 font-medium max-w-xs mx-auto">
            Your invoice details have been received.<br>
            <span class="text-blue-700 font-semibold">Processing will be completed in a few minutes.</span>
          </p>
          <div class="w-full flex flex-col items-center gap-2 mt-4">
            <svg class="h-10 w-10 text-green-400 animate-pulse" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" class="stroke-current opacity-30" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="text-sm text-gray-500">We will email you once the invoice is processed</span>
          </div>
          <!-- <button
            @click="$router.push('/user/orders')"
            class="mt-6 px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 via-yellow-400 to-blue-400 hover:scale-105 font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          >
            View My Orders
          </button> -->
        </div>
      </div>
    </div>
    </div>

    <!-- Invoice Information -->
    <div v-if="showOrderDetails && order" class="relative z-20 w-full max-w-2xl rounded-3xl bg-white/90 shadow-xl ring-1 ring-blue-100/70 px-2 py-2 overflow-hidden">
    <div class="flex flex-col gap-6">
      <!-- Order Header -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 justify-between px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 shadow-sm ring-1 ring-blue-100">
        <div>
          <h2 class="text-2xl font-extrabold text-blue-900 flex items-center gap-2">
            <svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor"/><path d="M8 6V4h8v2" stroke="currentColor"/></svg>
            Order Details
          </h2>
          <div class="text-gray-500 text-sm mt-1">Order ID: <span class="font-mono font-semibold text-blue-800">{{ order_id }}</span></div>
        </div>
        <a
          :href="order?.e_invoice_url || undefined"
          target="_blank"
          rel="noopener noreferrer"
          class="px-6 py-2 rounded-xl bg-white text-green-700 font-bold hover:scale-105 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-green-200 flex gap-2 items-center border-2 border-green-400"
          :class="{ 'opacity-50 pointer-events-none': !order?.e_invoice_url }"
          :tabindex="order?.e_invoice_url ? 0 : -1"
        >
          <svg class="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/></svg>
          View E-Invoice
        </a>
      </div>

      <!-- Order Summary Section-->
      <div class="bg-white/80 rounded-xl shadow ring-1 ring-slate-100 px-5 py-6">
        <div class="flex flex-col md:flex-row md:justify-between gap-4 mb-3">
          <div>
            <span class="text-sm text-gray-500">Invoice No.</span>
            <div class="font-bold text-gray-800">{{ order.invoice_number }}</div>
          </div>
          <div>
            <span class="text-sm text-gray-500">Order Date</span>
            <div class="font-medium text-gray-800">
              <span>{{
                new Date(order.order_date).toLocaleString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true, // show am/pm
                  timeZone: 'Asia/Kuala_Lumpur'
                })
              }}</span>
            </div>
          </div>
          <div>
            <span class="text-sm text-gray-500">Outlet Name</span>
            <div class="font-medium text-gray-800">{{ order.outlet?.name }}</div>
          </div>
        </div>
        <hr class="my-4">

        <!-- Order Items Table (Placeholder: replace `orderItems` with real data as available) -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2 flex gap-2 items-center">
            <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Items
          </h3>
          <table class="w-full divide-y divide-gray-100">
            <thead>
              <tr>
                <th class="text-left py-2 text-gray-700 text-xs font-semibold">Item</th>
                <th class="text-right py-2 text-gray-700 text-xs font-semibold">Qty</th>
                <th class="text-right py-2 text-gray-700 text-xs font-semibold">Unit Price</th>
                <th class="text-right py-2 text-gray-700 text-xs font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.order_items" :key="item.id" class="hover:bg-blue-50/60 transition">
                <td class="py-2 pr-2 font-medium text-gray-800">
                  <div>{{ item.product.name }}</div>
                  <div v-if="item.selected_modifier_groups && item.selected_modifier_groups.length" class="mt-1 text-xs text-gray-600 pl-2">
                    <ul class="list-disc ml-4">
                      <li v-for="mod in item.selected_modifier_groups" :key="mod.id">
                        <span>{{ mod.modifier_options.name }}</span>
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="py-2 text-right text-gray-600">
                  <div>{{ item.quantity }}</div>
                  <div v-if="item.selected_modifier_groups && item.selected_modifier_groups.length" class="mt-1 text-xs text-gray-600 pl-2">
                    <ul class="ml-4">
                      <li v-for="mod in item.selected_modifier_groups" :key="mod.id">
                        <span>{{ mod.modifier_option_quantity }}</span>
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="py-2 text-right text-gray-600">
                  <div>RM {{ Number(item.unit_price).toFixed(2) }}</div>
                  <div v-if="item.selected_modifier_groups && item.selected_modifier_groups.length" class="mt-1 text-xs text-gray-600 pl-2">
                    <ul class="ml-4">
                      <li v-for="mod in item.selected_modifier_groups" :key="mod.id">
                        <span>RM {{ Number(mod.modifier_options.price_adjustment).toFixed(2) }}</span>
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="py-2 text-right font-semibold text-gray-900">
                  <div>RM {{ (item.quantity * item.unit_price).toFixed(2) }}</div>
                  <div v-if="item.selected_modifier_groups && item.selected_modifier_groups.length" class="mt-1 text-xs text-gray-600 pl-2">
                    <ul class="ml-4">
                      <li v-for="mod in item.selected_modifier_groups" :key="mod.id">
                        <span>RM {{ (Number(mod.modifier_options.price_adjustment) * mod.modifier_option_quantity).toFixed(2) }}</span>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order Total  -->

        <div class="mt-6 flex flex-row items-center justify-end gap-4">
          <div class="text-right text-gray-600 font-medium">Gross Total:</div>
          <div class="text-base font-normal text-gray-800">RM {{ Number(order.gross_total).toFixed(2) }}</div>
        </div>
        <div class="mt-1 flex flex-row items-center justify-end gap-4" v-if="order.tax_percentage > 0">
          <div class="text-right text-gray-600 font-medium">
            Tax ({{ Number(order.tax_percentage).toFixed(2) }}%):
          </div>
          <div class="text-base font-normal text-gray-800">
            RM {{ Number(order.tax_charge).toFixed(2) }}
          </div>
        </div>
        <div class="mt-1 flex flex-row items-center justify-end gap-4" v-if="order.delivery_fee > 0">
          <div class="text-right text-gray-600 font-medium">Delivery Fee:</div>
          <div class="text-base font-normal text-gray-800">RM {{ Number(order.delivery_fee).toFixed(2) }}</div>
        </div>
        <div class="mt-1 flex flex-row items-center justify-end gap-4">
          <div class="text-right text-gray-600 font-medium">Net Total:</div>
          <div class="text-lg font-bold text-blue-900">RM {{ Number(order.net_total).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>