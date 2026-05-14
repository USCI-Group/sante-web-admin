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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { toast } from '~/components/ui/toast'
import type { Option } from '~/types/common'
const { getOutletsOptions } = useOutlets()
const { getMe, me } = useUsers()
interface Props {
  isOpen: boolean
  isLoading: boolean
  filter: {
    date_range: Date[]
    outlet_id: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': [value: boolean]
}>()

const filter = ref(props.filter)
const outletOptions = ref<string[]>([])
const outletOptionsWithId = ref<Option[]>([])
const selectedOutlet = ref<string>("All Outlets")

onMounted(async () => {
  await getMe()
  const res = await getOutletsOptions(me.value?.business_id ?? '')
  outletOptionsWithId.value = res
  outletOptions.value = res.map(outlet => outlet.name)
  outletOptions.value.unshift('All Outlets')
})

watch(() => props.filter.outlet_id, (newVal) => {
  if (newVal === 'All Outlets') {
    selectedOutlet.value = 'All Outlets'
  }
})

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  // Find the outlet with matching name and set the outlet_id
  if (selectedOutlet.value) {
    const selectedOutletObj = outletOptionsWithId.value.find(outlet => outlet.name === selectedOutlet.value)
    if (selectedOutletObj) {
      filter.value.outlet_id = selectedOutletObj.id
    }
    if(selectedOutlet.value === 'All Outlets'){
      filter.value.outlet_id = 'All Outlets'
    }
  } else {
    filter.value.outlet_id = ''
  }

  emit('submit', { ...filter.value })
}

const validateForm = () => {
  if((!filter.value.date_range[0] || !filter.value.date_range[1]) && !selectedOutlet.value){
    toast({
        title: 'Error',
        description: 'Please select at least one filter',
        variant: 'destructive',
    })
    return false
  }

  return true
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
            <DialogTitle>Filter</DialogTitle>
            <DialogDescription>
            Filter stock report by date, outlet
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <!-- <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                  <Label>From Date</Label>
                  <VueDatePicker v-model="filter.from_date" :enable-time-picker="false" />
              </div>

              <div class="grid gap-2">
                  <Label>To Date</Label>
                  <VueDatePicker v-model="filter.to_date" :enable-time-picker="false" />
              </div>
            </div> -->

            <div class="grid grid-cols-1 gap-4">
                <Label>Date Range</Label>
                <VueDatePicker 
                  v-model="filter.date_range"
                  :enable-time-picker="false"
                  :range="true"
              />
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div class="grid gap-2">
                  <Label>Outlet</Label>
                  <CustomSearchSelect v-model="selectedOutlet" :options="outletOptions" />
              </div>
            </div>

        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
            {{ isLoading ? 'Filtering...' : 'Filter' }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
