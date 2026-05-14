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
import type { StockReport } from '@/types/menu'

interface Props {
  isOpen: boolean
  isLoading: boolean
  stockReport: StockReport
  form: {
    column: string
    value: number
    date: Date
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': [value: boolean]
}>()

onMounted(async () => {
})

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  emit('submit', { ...props.form })
}

const validateForm = () => {
  if(!props.form.value){
    toast({
        title: 'Error',
        description: 'Please enter a value',
        variant: 'destructive',
    })
    return false
  }

  if(props.form.value <= 0){
    toast({
        title: 'Error',
        description: 'Please enter a value greater than 0',
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
            <DialogTitle>Edit Stock Report</DialogTitle>
            <DialogDescription>
            Edit stock report by item, old value, new value
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <div class="flex gap-8 items-center">
              <div class="flex flex-col gap-2 w-1/2">
                <Label class="font-bold">Item</Label>
                <span>{{ stockReport.ingredient?.name }}</span>
              </div>
              <div class="flex flex-col gap-2 w-1/2">
                <Label class="font-bold">Column</Label>
                <span>{{ form.column.toUpperCase() }}</span>
              </div>
            </div>
            <div class="flex gap-8 items-center">
              <div class="flex flex-col gap-2 w-1/2">
                <Label class="font-bold">New Value</Label>
                <Input v-model="form.value" type="number" />
              </div>
            </div>

            <hr class="mt-4">
            <div class="flex items-center justify-center gap-4">
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500 font-medium mb-1">Old value</span>
                <span class="text-lg font-semibold">
                  <span v-if="form.column === 'opening'">{{ stockReport.opening }}</span> 
                  <span v-else-if="form.column === 'closing'">{{ stockReport.closing }}</span>
                  <span v-else-if="form.column === 'purchases'">{{ stockReport.purchases }}</span>
                  <span class="ml-1 text-xs text-gray-500 font-medium mb-1">{{ stockReport.ingredient?.unit }}</span>
                </span>
              </div>
              <span
                class="text-2xl"
                :class="(form.value <= 0) ? 'text-red-500' : 'text-green-400'"
              >&#8594;</span>
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500 font-medium mb-1">New value</span>
                <span class="text-lg font-semibold">{{ form.value }} <span class="text-xs text-gray-500 font-medium mb-1">{{ stockReport.ingredient?.unit }}</span></span>
              </div>
            </div>
            <hr>
        </div>


        <DialogFooter>
            <Button variant="outline" :disabled="isLoading" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
            {{ isLoading ? 'Saving...' : 'Save' }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
