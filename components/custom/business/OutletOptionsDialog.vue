<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ref, watch } from 'vue'
import { useOutlets } from '@/composables/useOutlets'
import type { Option } from '@/types/common'

interface Props {
  isOpen: boolean
  businessId: string
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [selectedOutletId: string]
  'cancel': []
}>()

const { getOutletsOptions } = useOutlets()

const outletOptions = ref<Option[]>([])
const isFetching = ref(false)
const selectedOutletId = ref<string>('')

watch(
  () => props.isOpen,
  async (open) => {
    if (open && props.businessId) {
      await fetchOutletOptions()
    }
  },
  { immediate: true }
)

const fetchOutletOptions = async () => {
  isFetching.value = true
  try {
    const data = await getOutletsOptions(props.businessId)
    outletOptions.value = data || []
  } catch (e) {
    outletOptions.value = []
  } finally {
    isFetching.value = false
  }
}

const handleSubmit = () => {
  emit('submit', selectedOutletId.value)
  selectedOutletId.value = ''
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          Select Outlet
        </DialogTitle>
        <DialogDescription>
          Choose an outlet to assign.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div v-if="isFetching" class="text-center text-gray-500 py-8">
          Loading outlets...
        </div>
        <div v-else-if="outletOptions.length === 0" class="text-center text-gray-500 py-8">
          No outlets found.
        </div>
        <div v-else>
          <Select v-model="selectedOutletId" placeholder="Select outlet">
              <SelectTrigger>
                  <SelectValue placeholder="Select outlet" />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                      <SelectItem v-for="outletOption in outletOptions" :key="outletOption.id" :value="outletOption.id">
                          {{ outletOption.name }}
                      </SelectItem>
                  </SelectGroup>
              </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button
          type="submit"
          :disabled="isLoading || !selectedOutletId"
          @click="handleSubmit"
          class="btn-primary"
        >
          {{ isLoading ? 'Saving...' : 'Save Selection' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
