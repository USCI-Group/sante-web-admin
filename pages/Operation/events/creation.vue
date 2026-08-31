<template>
  <div class="max-w-3xl mx-auto space-y-6 pb-12">
    <div class="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <NuxtLink to="/Operation/events" class="hover:text-primary transition-colors flex items-center">
        <Icon name="heroicons:home" class="w-4 h-4 mr-1" />
        Events
      </NuxtLink>
      <Icon name="heroicons:chevron-right" class="w-4 h-4" />
      <span class="text-gray-900 font-medium">Create Event</span>
    </div>

    <div>
      <h2 class="text-2xl font-bold tracking-tight text-gray-900">Create New Event</h2>
      <p class="text-sm text-gray-500 mt-1">Add a new party or event to the mobile app gallery.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 space-y-6">
        
        <!-- Event Title -->
        <div class="space-y-2">
          <Label class="text-sm font-semibold text-gray-700">Event Title <span class="text-red-500">*</span></Label>
          <Input v-model="form.title" placeholder="e.g. Sante Summer Party 2026" class="w-full" />
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label class="text-sm font-semibold text-gray-700">Description <span class="text-red-500">*</span></Label>
          <Textarea v-model="form.description" placeholder="Write about the event..." rows="4" class="w-full resize-none" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Event Date -->
          <div class="space-y-2">
            <Label class="text-sm font-semibold text-gray-700">Event Date <span class="text-red-500">*</span></Label>
            <Input v-model="form.event_date" type="date" class="w-full" />
          </div>

          <!-- Image URL -->
          <div class="space-y-2">
            <Label class="text-sm font-semibold text-gray-700">Image URL <span class="text-red-500">*</span></Label>
            <Input v-model="form.image_url" placeholder="https://example.com/image.jpg" class="w-full" />
            <p class="text-xs text-gray-500">For now, please paste a direct link to an image.</p>
          </div>
        </div>

      </div>
      
      <!-- Footer Actions -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
        <Button variant="outline" @click="$router.push('/Operation/events')" class="bg-white">
          Cancel
        </Button>
        <Button @click="submit" :disabled="loading" class="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
          <span v-if="loading" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating...
          </span>
          <span v-else>Create Event</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/store/AuthStore'
import { useToast } from '@/components/ui/toast/use-toast'

const router = useRouter()
const { toast } = useToast()
const authStore = useAuthStore()
const { token, data } = useAuth()
const config = useRuntimeConfig()
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  event_date: '',
  image_url: ''
})

const submit = async () => {
  if (!form.title || !form.description || !form.event_date || !form.image_url) {
    toast({ title: 'Error', description: 'Please fill in all fields.', variant: 'destructive' })
    return
  }

  loading.value = true
  try {
    const businessId = data.value?.user?.business_id || authStore.getUser?.business_id
    
    // Convert local date string to RFC3339 timestamp
    const dateObj = new Date(form.event_date)
    const rfcDate = dateObj.toISOString()

    await $fetch(`${config.public.apiUrl}/api/admin/events`, {
      method: 'POST',
      headers: { Authorization: token.value },
      body: {
        business_id: businessId,
        title: form.title,
        description: form.description,
        image_url: form.image_url,
        event_date: rfcDate
      }
    })

    toast({ title: 'Success', description: 'Event created successfully!' })
    router.push('/Operation/events')
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to create event.', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}
</script>
