<template>
  <div class="px-5 w-full bg-white h-screen overflow-hidden overflow-y-auto pt-6 flex flex-col pb-[350px]">
    <!-- Header -->
    <div class="flex flex-col gap-2 w-full mt-2">
      <div class="flex items-center gap-1 cursor-pointer" @click="$router.push('/Product/products')">
        <Icon name="mdi:home-outline" class="text-xl text-[#011B1F] opacity-50" />
        <Icon name="mdi:chevron-right" class="text-xl text-[#011B1F] opacity-50" />
        <div class="bg-[#10B981] px-2 py-1 rounded-md text-white font-medium flex items-center gap-2 text-sm shadow-md">
          <Icon name="mdi:gift-outline" class="text-lg text-white" /> Vouchers & Rewards
        </div>
      </div>
      <div class="font-bold text-lg text-[#011B1F]">Vouchers Management</div>
      <div class="text-[#011B1F] opacity-60 text-sm">
        Manage loyalty vouchers, points redemption rules, and rewards.
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center mt-6">
      <div class="flex items-center gap-2 w-1/3">
        <Input class="w-full h-10 border border-gray-200 rounded-lg shadow-sm" placeholder="Search Vouchers" />
      </div>
      <Button class="bg-[#10B981] hover:bg-[#059669] text-white flex items-center gap-2 px-4 shadow-md rounded-lg" @click="$router.push('/Product/vouchers/creation')">
        <Icon name="mdi:plus" class="text-lg" /> Add Voucher
      </Button>
    </div>

    <!-- Table -->
    <div class="mt-6 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader class="bg-gray-50 border-b border-gray-100">
          <TableRow>
            <TableHead class="font-semibold text-gray-600">Voucher Name</TableHead>
            <TableHead class="font-semibold text-gray-600">Description</TableHead>
            <TableHead class="font-semibold text-gray-600">Points Cost</TableHead>
            <TableHead class="font-semibold text-gray-600">Discount</TableHead>
            <TableHead class="font-semibold text-gray-600 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="voucher in vouchers" :key="voucher.id" class="hover:bg-gray-50 transition-colors">
            <TableCell class="font-medium text-gray-800">{{ voucher.name }}</TableCell>
            <TableCell class="text-gray-500 max-w-[250px] truncate">{{ voucher.description }}</TableCell>
            <TableCell>
              <div class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold inline-block border border-yellow-200">
                {{ voucher.redeem_value }} pts
              </div>
            </TableCell>
            <TableCell class="text-gray-600 font-medium">
               RM {{ voucher.discount_value }}
            </TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" class="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 px-3" @click="deleteVoucher(voucher.id)">
                <Icon name="mdi:trash-can-outline" class="text-lg mr-1" /> Delete
              </Button>
            </TableCell>
          </TableRow>
          <TableRow v-if="vouchers.length === 0 && !loading">
            <TableCell colspan="5" class="h-32 text-center text-gray-500">
              No vouchers found. Click "Add Voucher" to create one.
            </TableCell>
          </TableRow>
          <TableRow v-if="loading">
            <TableCell colspan="5" class="h-32 text-center text-gray-500">
              Loading vouchers...
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/store/AuthStore'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const authStore = useAuthStore()
const { token, data } = useAuth()
const config = useRuntimeConfig()
const vouchers = ref([])
const loading = ref(true)

const fetchVouchers = async () => {
  loading.value = true
  try {
    const businessId = data.value?.user?.business_id || authStore.getUser?.business_id
    const response = await $fetch(`${config.public.apiUrl}/api/admin/vouchers/${businessId}`, {
      headers: { Authorization: token.value }
    })
    vouchers.value = response.vouchers || []
  } catch (error) {
    console.error('Failed to fetch vouchers', error)
  } finally {
    loading.value = false
  }
}

const deleteVoucher = async (id) => {
  if (!confirm('Are you sure you want to delete this voucher?')) return
  try {
    const businessId = data.value?.user?.business_id || authStore.getUser?.business_id
    await $fetch(`${config.public.apiUrl}/api/admin/vouchers/${businessId}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token.value }
    })
    toast({ title: 'Success', description: 'Voucher deleted successfully.' })
    fetchVouchers()
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to delete voucher.', variant: 'destructive' })
  }
}

onMounted(() => {
  fetchVouchers()
})
</script>
