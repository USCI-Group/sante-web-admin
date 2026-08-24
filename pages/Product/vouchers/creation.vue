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
          <Label class="text-sm font-semibold text-gray-700">Voucher Name <span class="text-red-500">*</span></Label>
          <Input v-model="form.name" placeholder="e.g. RM 10 Off Voucher" class="h-11 bg-gray-50 border-gray-200" />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-2">
          <Label class="text-sm font-semibold text-gray-700">Description <span class="text-red-500">*</span></Label>
          <Textarea v-model="form.description" placeholder="e.g. Redeem 200 points to get RM 10 off your total bill." class="bg-gray-50 border-gray-200" rows="3" />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- Points Cost -->
          <div class="flex flex-col gap-2">
            <Label class="text-sm font-semibold text-gray-700">Points Cost <span class="text-red-500">*</span></Label>
            <div class="relative">
              <Input v-model.number="form.points_cost" type="number" placeholder="200" class="h-11 pl-10 bg-gray-50 border-gray-200" />
              <div class="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon name="mdi:star-circle" class="text-yellow-400 text-lg" />
              </div>
            </div>
          </div>

          <!-- Discount Value -->
          <div class="flex flex-col gap-2">
            <Label class="text-sm font-semibold text-gray-700">Discount Value (RM) <span class="text-red-500">*</span></Label>
            <div class="relative">
              <Input v-model.number="form.discount_value" type="number" placeholder="10.00" class="h-11 pl-10 bg-gray-50 border-gray-200" />
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
        <Button variant="outline" class="h-11 px-6 border-gray-200" @click="$router.push('/Product/vouchers')">Cancel</Button>
        <Button :disabled="loading" class="h-11 px-8 bg-[#10B981] hover:bg-[#059669] text-white shadow-md" @click="submit">
          <Icon v-if="loading" name="mdi:loading" class="animate-spin mr-2" />
          Create Voucher
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/store/auth'
import { useToast } from '@/components/ui/toast/use-toast'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  points_cost: null,
  discount_value: null,
  discount_type: 'fixed'
})

const submit = async () => {
  if (!form.name || !form.description || !form.points_cost || !form.discount_value) {
    toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' })
    return
  }

  loading.value = true
  try {
    await $fetch(`${config.public.apiBaseUrl}/api/admin/vouchers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        business_id: authStore.user.business_id,
        ...form
      }
    })
    toast({ title: 'Success', description: 'Voucher created successfully!' })
    router.push('/Product/vouchers')
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to create voucher.', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}
</script>
