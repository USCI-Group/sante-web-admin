<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useTax } from '@/composables/useTax'
import type { Tax } from '@/types/tax'
import { useToast } from '~/components/ui/toast/use-toast'
import { useUsers } from '@/composables/useUsers'
import { Label } from '@/components/ui/label'

const { createTax } = useTax()
const { toast } = useToast()
const { myProfile } = useMyProfileStore()

// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: boolean
}>()

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
    name: '',
    external_id: '',
    rate_percentage: 0,
    is_inclusive: false,
    business_id: '',
})

const validationSchema = {
    name : {
        condition: () => formData.name.trim() === '',
        message: 'Please enter a tax name'
    },
    rate_percentage: {
        condition: () => formData.rate_percentage < 0,
        message: 'Rate percentage cannot be negative'
    },
    business_id: {
        condition: () => formData.business_id.trim() === '',
        message: 'User does not belong to any business'
    }
}

const submitForm = async() => {
    const business_id = myProfile?.business_id ?? ''
    formData.business_id = business_id
    // validate formData
    const errors = Object.entries(validationSchema)
    .filter(([_, { condition }]) => condition())
    .map(([_, { message }]) => message)
    
    if (errors.length > 0) {
        toast({
            title: 'Validation Errors',
            description: errors[0],
            variant: 'destructive'
        })
        return
    }
    
    const tax : Tax = {
        business_id: formData.business_id,
        external_id: formData.external_id.trim() || undefined,
        name: formData.name.trim(),
        rate_percentage: formData.rate_percentage,
        is_inclusive: formData.is_inclusive,
    }

    try {
        await createTax(tax)
        toast({
            title: 'Tax Added',
            description: 'Tax added successfully',
            variant: 'success'
        })
        dialogOpen.value = false
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error?.message ?? 'Something went wrong',
            variant: 'destructive'
        })
    }
}
</script>

<template>
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent>
            <DialogHeader>
                <div class="flex justify-start items-center space-x-3">
                    <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                        <Icon icon="heroicons:receipt-tax" class="w-6 h-6" />
                    </div>
                    <div class="flex flex-col justify-center items-start">
                        <DialogTitle class="text-2xl font-bold">Add Tax</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Add a new tax configuration</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div class="flex flex-col h-[70vh] w-full space-y-5 overflow-y-auto px-2">
                <h2 class="text-xl font-semibold">Tax Details</h2>
                <div>
                    <Label>Tax Name <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.name" class="w-full" placeholder="e.g. SST 6%" />
                </div>
                <div>
                    <Label>External ID <span class="text-xs text-gray-400 font-normal ml-1">(Optional, for POS Sync)</span></Label>
                    <Input v-model="formData.external_id" class="w-full" placeholder="e.g. T1" />
                </div>
                <div>
                    <Label>Rate Percentage (%) <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.rate_percentage" type="number" class="w-full" placeholder="6" />
                </div>
                <div class="flex items-center justify-between mt-4">
                    <div class="flex flex-col">
                        <Label>Inclusive Tax</Label>
                        <span class="text-xs text-gray-500">If active, this tax is already included in the product's price.</span>
                    </div>
                    <Switch v-model="formData.is_inclusive" :checked="formData.is_inclusive" />
                </div>
                <DialogFooter>
                    <Button @click="submitForm" class="hover:bg-red-500">Add Tax</Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>
