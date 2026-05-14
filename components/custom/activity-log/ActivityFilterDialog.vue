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

interface Props {
  isOpen: boolean
  isLoading: boolean
  filter: {
    from_date: string
    to_date: string
    action_by: string
    status: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': [value: boolean]
}>()

const filter = ref(props.filter)

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  emit('submit', { ...filter.value })
}

const validateForm = () => {
  if(!filter.value.from_date && !filter.value.to_date && !filter.value.action_by && !filter.value.status){
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
            Filter activity logs by date, action by, and status
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>From Date</Label>
                <VueDatePicker v-model="filter.from_date" />
            </div>

            <div class="grid gap-2">
                <Label>To Date</Label>
                <VueDatePicker v-model="filter.to_date" />
            </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div class="grid gap-2">
                  <Label>Status</Label>
                  <Select v-model="filter.status">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
            <div class="grid gap-2">
                <Label>Action By</Label>
                <Input
                type="text"
                v-model="filter.action_by"
                placeholder="Enter action by"
                />
            </div>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit">
            {{ isLoading ? 'Filtering...' : 'Filter' }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
