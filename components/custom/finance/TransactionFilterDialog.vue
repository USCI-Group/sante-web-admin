<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Icon } from "@iconify/vue";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { toast } from '~/components/ui/toast'
import type { Option, SelectOption } from '~/types/common'
import { PaymentMethodOptions, type PaymentMethodType } from '~/constants/payment'
const { getMe, me } = useUsers()
const { getAllProducts } = useMenu()
const { getOutletsOptions, getOutletGroupsByUserId } = useOutlets()

interface Props {
  isOpen: boolean
  isLoading: boolean
  filter: {
    payment_methods: SelectOption[]
    products: SelectOption[]
    outlet_id: string
    outlet_group_id: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': [value: boolean]
}>()

const filter = ref(props.filter)
const selectedFilterType = ref<string>('Payment Method')

const paymentMethodSelectOptions = ref<SelectOption[]>([])
const productSelectOptions = ref<SelectOption[]>([])
const outletOptions = ref<Option[]>([])
const outletGroups = ref<Option[]>([])

// Watch for changes in the filter prop
watch(() => props.filter, (newFilter) => {
  // Update payment method inputs when filter changes
  if (newFilter.payment_methods && newFilter.payment_methods.length > 0) {
    paymentMethodSelectOptions.value = newFilter.payment_methods
  }

  if (newFilter.products && newFilter.products.length > 0) {
    productSelectOptions.value = newFilter.products
  }
}, { deep: true })


onMounted(async () => {
  await getMe()
  outletOptions.value = await getOutletsOptions(me.value?.business_id as string)
  await fetchOutletGroupsByUserId()
  
  // Get product options
  try {
    const res:any = await getAllProducts(me.value?.business_id ?? '')
    productSelectOptions.value = res.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      selected: false
    }))
  } catch (error) {
    productSelectOptions.value = []
  }

  // Get payment method options
  paymentMethodSelectOptions.value = PaymentMethodOptions.map((method) => ({
    id: method,
    name: method,
    selected: false
  }))
})

const fetchOutletGroupsByUserId = async () => {
    try {
        const res = await getOutletGroupsByUserId(me.value?.id as string)
        const outlet_group_options: Option[] = []
        res.outlet_groups.forEach(outlet_group => {
            outlet_group_options.push({
                id: outlet_group.id as string,
                name: outlet_group.name as string
            })
        });
        outletGroups.value = outlet_group_options
    } catch (error: any) {
      outletGroups.value = []
    }
}

const handleSubmit = () => {
  filter.value.payment_methods = paymentMethodSelectOptions.value
  filter.value.products = productSelectOptions.value
  
  if(!validateForm()){
    return
  }

  emit('submit', { ...filter.value })
}

const validateForm = () => {
  if(checkIfAllNotSelected(filter.value.payment_methods) && checkIfAllNotSelected(filter.value.products) && filter.value.outlet_id === '' && filter.value.outlet_group_id === ''){
    toast({
        title: 'Error',
        description: 'Please select at least one filter',
        variant: 'destructive',
    })
    return false
  }

  return true
}

const checkIfAllNotSelected = (options: SelectOption[]) => {
  return options.every(option => !option.selected)
}

const handleCancel = () => {
  emit('cancel', false)
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle></DialogTitle>
        <DialogDescription>
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col md:flex-row">
        <!-- Left Side -->
        <div class="md:w-1/3">
          <div
              @click="selectedFilterType = 'Payment Method'"
              class="max-w-md flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer"
              :class="{
                'bg-[#FFF4ED] text-[#FF4405] border border-[#FF4405]': selectedFilterType === 'Payment Method',
                'text-gray-400': selectedFilterType !== 'Payment Method'
              }"
            >
            <span class="mr-3">
              <Icon icon="heroicons:banknotes" class="h-5 w-5" />
            </span>
            <span class="text-sm font-medium">Payment Method</span>
            <Icon icon="heroicons:chevron-right" class="h-4 w-4 ml-auto" />
          </div>
          <div
              @click="selectedFilterType = 'Product'"
              class="max-w-md flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer"
              :class="{
                'bg-[#FFF4ED] text-[#FF4405] border border-[#FF4405]': selectedFilterType === 'Product',
                'text-gray-400': selectedFilterType !== 'Product'
              }"
            >
            <span class="mr-3">
              <Icon icon="heroicons:shopping-bag" class="h-5 w-5" />
            </span>
            <span class="text-sm font-medium">Product</span>
            <Icon icon="heroicons:chevron-right" class="h-4 w-4 ml-auto" />
          </div>
          <div
              @click="selectedFilterType = 'Outlet'"
              class="max-w-md flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer"
              :class="{
                'bg-[#FFF4ED] text-[#FF4405] border border-[#FF4405]': selectedFilterType === 'Outlet',
                'text-gray-400': selectedFilterType !== 'Outlet'
              }"
            >
            <span class="mr-3">
              <Icon icon="heroicons:building-storefront" class="h-5 w-5" />
            </span>
            <span class="text-sm font-medium">Outlet</span>
            <Icon icon="heroicons:chevron-right" class="h-4 w-4 ml-auto" />
          </div>
          <div
              @click="selectedFilterType = 'Outlet Group'"
              class="max-w-md flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer"
              :class="{
                'bg-[#FFF4ED] text-[#FF4405] border border-[#FF4405]': selectedFilterType === 'Outlet Group',
                'text-gray-400': selectedFilterType !== 'Outlet Group'
              }"
            >
            <span class="mr-3">
              <Icon icon="heroicons:building-storefront" class="h-5 w-5" />
            </span>
            <span class="text-sm font-medium">Outlet Group</span>
            <Icon icon="heroicons:chevron-right" class="h-4 w-4 ml-auto" />
          </div>
        </div>

        <!-- Right Side -->
        <div class="md:w-2/3 px-4">
          <div v-if="selectedFilterType === 'Payment Method'">
            <div class="py-3">Select {{ selectedFilterType }} to filter</div>
            <hr>
            <div v-for="paymentMethod in paymentMethodSelectOptions" class="flex items-center p-2">
                <Checkbox v-model="paymentMethod.selected" />
                <span class="mx-2">{{ paymentMethod.name }}</span>
                <span v-if="paymentMethod.name === 'CASHLESS' || paymentMethod.name === 'CASH'"><Icon icon="simple-icons:grab" class="w-10 h-10" /></span>
            </div>
          </div>
          <div v-if="selectedFilterType === 'Product'">
            <div class="py-3">Select {{ selectedFilterType }} to filter</div>
            <hr>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="product in productSelectOptions" class="flex items-center p-2">
                  <Checkbox v-model="product.selected" />
                  <span class="mx-2">{{ product.name }}</span>
              </div>
            </div>
          </div>
          <div v-if="selectedFilterType === 'Outlet'">
            <div class="py-3">Select {{ selectedFilterType }} to filter</div>
            <hr class="mb-4">
            <Select v-model="filter.outlet_id">
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

          <div v-if="selectedFilterType === 'Outlet Group'">
            <div class="py-3">Select {{ selectedFilterType }} to filter</div>
            <hr class="mb-4">
            <Select v-model="filter.outlet_group_id">
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="outletGroup in outletGroups" :key="outletGroup.id" :value="outletGroup.id">
                    {{ outletGroup.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
      </div>


      <!-- <div class="grid gap-4 py-4">
            <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>From Date</Label>
                <VueDatePicker v-model="filter.from_date" :enable-time-picker="false" />
            </div>

            <div class="grid gap-2">
                <Label>To Date</Label>
                <VueDatePicker v-model="filter.to_date" :enable-time-picker="false" />
            </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div class="grid gap-2">
                  <Label>Outlet</Label>
                  <CustomSearchSelect v-model="selectedOutlet" :options="outletOptions" />
              </div>
            </div>

        </div> -->

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
        {{ isLoading ? 'Filtering...' : 'Filter' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
