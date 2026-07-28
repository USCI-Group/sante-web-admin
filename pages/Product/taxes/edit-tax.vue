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
import { Label } from '@/components/ui/label'

const { updateTax } = useTax()
const { toast } = useToast()

const props = defineProps<{
  modelValue: boolean
  tax: Tax
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
    name: props.tax?.name || '',
    external_id: props.tax?.external_id || '',
    rate_percentage: props.tax?.rate_percentage || 0,
    is_inclusive: props.tax?.is_inclusive || false,
    is_active: props.tax?.is_active ?? true,
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
}

const submitForm = async() => {
    const errors = Object.entries(validationSchema)
    .filter(([_, { condition }]) => condition())
    .map(([_, { message }]) => message)
    
    if (errors.length > 0) {
        toast({
            title: 'Validation Errors',
            description: errors.join('\n'),
            variant: 'destructive'
        })
        return
    }
    
    const taxPayload : Tax = {
        id: props.tax?.id || '',
        business_id: props.tax?.business_id || '',
        external_id: formData.external_id.trim() || undefined,
        name: formData.name.trim(),
        rate_percentage: formData.rate_percentage,
        is_inclusive: formData.is_inclusive,
        is_active: formData.is_active,
    }

    try {
        await updateTax(taxPayload)
        toast({
            title: 'Tax Updated',
            description: 'Tax updated successfully',
            variant: 'success'
        })
        emit('success')
        dialogOpen.value = false
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Error editing tax',
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
                        <DialogTitle class="text-2xl font-bold">Edit Tax</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Edit the tax configuration</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <div class="flex flex-col h-[70vh] w-full space-y-5 overflow-y-auto px-2">
                <h2 class="text-xl font-semibold">Tax Details</h2>
                <div>
                    <Label>Tax Name <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.name" class="w-full" />
                </div>
                <div>
                    <Label>External ID <span class="text-xs text-gray-400 font-normal ml-1">(Optional, for POS Sync)</span></Label>
                    <Input v-model="formData.external_id" class="w-full" />
                </div>
                <div>
                    <Label>Rate Percentage (%) <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.rate_percentage" type="number" class="w-full" />
                </div>
                <div class="flex items-center justify-between mt-4">
                    <div class="flex flex-col">
                        <Label>Inclusive Tax</Label>
                        <span class="text-xs text-gray-500">If active, this tax is already included in the product's price.</span>
                    </div>
                    <Switch v-model="formData.is_inclusive" :checked="formData.is_inclusive" />
                </div>
                <div class="flex items-center justify-between mt-4">
                    <div class="flex flex-col">
                        <Label>Active Status</Label>
                        <span class="text-xs text-gray-500">Enable or disable this tax from being applied.</span>
                    </div>
                    <Switch v-model="formData.is_active" :checked="formData.is_active" />
                </div>
                <DialogFooter>
                    <Button @click="submitForm" class="hover:bg-red-500">Save</Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>
