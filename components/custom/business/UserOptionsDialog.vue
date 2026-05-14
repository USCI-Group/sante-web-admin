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
import { useUsers } from '@/composables/useUsers'
import type { Option } from '@/types/common'

interface Props {
  isOpen: boolean
  businessId: string
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [selectedUserId: string]
  'cancel': []
}>()

const { getUsersWithOutletGroupRole } = useUsers()

const userOptions = ref<Option[]>([])
const isFetching = ref(false)
const selectedUserId = ref<string>('')

watch(
  () => props.isOpen,
  async (open) => {
    if (open && props.businessId) {
      await fetchUserOptions()
    }
  },
  { immediate: true }
)

const fetchUserOptions = async () => {
  isFetching.value = true
  try {
    const data = await getUsersWithOutletGroupRole(props.businessId)
    userOptions.value = data || []
  } catch (e) {
    userOptions.value = []
  } finally {
    isFetching.value = false
  }
}

const handleSubmit = () => {
  emit('submit', selectedUserId.value)
  selectedUserId.value = ''
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
          Select User
        </DialogTitle>
        <DialogDescription>
          Choose a user to assign.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <div v-if="isFetching" class="text-center text-gray-500 py-8">
          Loading users...
        </div>
        <div v-else-if="userOptions.length === 0" class="text-center text-gray-500 py-8">
          No users found.
        </div>
        <div v-else>
          <Select v-model="selectedUserId" placeholder="Select user">
              <SelectTrigger>
                  <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                      <SelectItem v-for="userOption in userOptions" :key="userOption.id" :value="userOption.id">
                          {{ userOption.name }}
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
          :disabled="isLoading || !selectedUserId"
          @click="handleSubmit"
          class="btn-primary"
        >
          {{ isLoading ? 'Saving...' : 'Save Selection' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
