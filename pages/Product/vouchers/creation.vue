<template>
  <div class="px-5 w-full bg-white h-screen overflow-hidden overflow-y-auto pt-6 flex flex-col pb-[350px]">
    <!-- Header -->
    <div class="flex flex-col gap-2 w-full mt-2">
      <div class="flex items-center gap-1 cursor-pointer" @click="$router.push('/Product/vouchers')">
        <Icon name="mdi:home-outline" class="text-xl text-[#011B1F] opacity-50" />
        <Icon name="mdi:chevron-right" class="text-xl text-[#011B1F] opacity-50" />
        <div class="text-[#011B1F] opacity-50 font-medium text-sm">Vouchers</div>
        <Icon name="mdi:chevron-right" class="text-xl text-[#011B1F] opacity-50" />
        <div class="bg-[#10B981] px-2 py-1 rounded-md text-white font-medium flex items-center gap-2 text-sm shadow-md">
          <Icon name="mdi:plus-circle-outline" class="text-lg text-white" /> Create Voucher
        </div>
      </div>
      <div class="font-bold text-lg text-[#011B1F]">Create New Loyalty Reward</div>
      <div class="text-[#011B1F] opacity-60 text-sm">
        Configure a new loyalty voucher that customers can redeem using their points.
      </div>
    </div>

    <!-- Form -->
    <div class="mt-8 max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div class="flex flex-col gap-6">
        
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Voucher Name <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" placeholder="e.g. RM 10 Off Voucher" class="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Description <span class="text-red-500">*</span></label>
          <textarea v-model="form.description" rows="3" placeholder="e.g. Redeem 200 points to get RM 10 off your total bill." class="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Points Cost -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-gray-700">Points Cost <span class="text-red-500">*</span></label>
            <div class="relative">
              <input v-model="form.points_cost" type="number" placeholder="200" class="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" />
              <div class="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon name="mdi:star-circle" class="text-yellow-400 text-lg" />
              </div>
            </div>
          </div>

          <!-- Discount Value -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-gray-700">Discount Value (RM) <span class="text-red-500">*</span></label>
            <div class="relative">
              <input v-model="form.discount_value" type="number" step="0.01" placeholder="10.00" class="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent" />
              <div class="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                RM
              </div>
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2 flex items-start gap-3">
          <Icon name="mdi:information" class="text-blue-500 text-xl flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800">
            <strong>Note:</strong> This voucher will automatically be configured as a <strong>Fixed Discount</strong> applicable to all users and platforms (Mobile App & POS). It will be valid for 1 year from the creation date.
          </div>
        </div>

      </div>

      <div class="mt-8 flex justify-end gap-3">
        <button class="h-11 px-6 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors" @click="$router.push('/Product/vouchers')">Cancel</button>
        <button :disabled="loading" class="h-11 px-8 bg-[#10B981] hover:bg-[#059669] text-white rounded-md text-sm font-medium shadow-md disabled:opacity-50 transition-colors" @click="submit">
          <span v-if="loading">Creating...</span>
          <span v-else>Create Voucher</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/store/AuthStore'
import { useToast } from '@/components/ui/toast/use-toast'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()
const { token, data } = useAuth()
const config = useRuntimeConfig()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  points_cost: '',
  discount_value: '',
  discount_type: 'fixed'
})

const submit = async () => {
  const pointsCost = Number(form.points_cost)
  const discountValue = Number(form.discount_value)

  if (!form.name.trim() || !form.description.trim() || !pointsCost || !discountValue) {
    toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' })
    return
  }

  loading.value = true
  try {
    const businessId = data.value?.user?.business_id || authStore.getUser?.business_id
    await $fetch(`${config.public.apiUrl}/api/admin/vouchers`, {
      method: 'POST',
      headers: { Authorization: token.value },
      body: {
        business_id: businessId,
        name: form.name.trim(),
        description: form.description.trim(),
        points_cost: pointsCost,
        discount_value: discountValue,
        discount_type: form.discount_type
      }
    })
    toast({ title: 'Success', description: 'Voucher created successfully!' })
    router.push('/Product/vouchers')
  } catch (error) {
    console.error('Voucher creation error:', error)
    toast({ title: 'Error', description: error?.data?.message || 'Failed to create voucher.', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}
</script>
