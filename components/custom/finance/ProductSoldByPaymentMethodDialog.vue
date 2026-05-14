<template>
  <Dialog :open="isOpen" @update:open="closeDialog">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Products Sold By Payment Method</DialogTitle>
        <DialogDescription>
          View the breakdown of products sold by each payment method.
        </DialogDescription>
      </DialogHeader>
      <div class="overflow-x-auto mt-4">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th v-for="paymentMethod in props.paymentMethod" :key="paymentMethod" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{{ paymentMethod }}</th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Sold</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="productSold in props.salesByProduct" :key="productSold.product.id">
              <td v-if="productSold.quantity_sold > 0" class="px-4 py-2 text-left text-xs font-medium text-gray-500">{{ productSold.product.name }}</td>
              <td
                v-if="productSold.quantity_sold > 0"
                v-for="paymentMethod in props.paymentMethod"
                :key="paymentMethod"
                class="px-4 py-2 text-right text-xs font-medium text-gray-500"
              >
                {{
                  productSold.sold_by_payment_method
                    ? (
                        Object.entries(productSold.sold_by_payment_method).find(
                          ([key]) => key === paymentMethod
                        )?.[1] ?? 0
                      ).toLocaleString()
                    : (0).toLocaleString()
                }}
              </td>
              <td
                v-if="productSold.quantity_sold > 0"
                class="px-4 py-2 text-right text-xs font-medium text-gray-500"
              >
                {{ productSold.quantity_sold.toLocaleString() }}
              </td>
            </tr>
            <tr v-if="props.paymentMethod.length === 0">
              <td colspan="2" class="px-4 py-6 text-center text-gray-400">No data available</td>
            </tr>
          </tbody>
        </table>
      </div>
      <DialogFooter class="mt-6">
        <Button variant="outline" @click="closeDialog">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import type { SalesByProduct } from '~/types/finance'

const props = defineProps<{
  open: boolean
  salesByProduct: SalesByProduct[]
  paymentMethod: string[]
}>()
const emit = defineEmits(['close'])

const isOpen = ref(props.open)
watch(() => props.open, (val) => { isOpen.value = val })
watch(isOpen, (val) => { if (!val) emit('close') })

function closeDialog() {
  isOpen.value = false
}

</script>
