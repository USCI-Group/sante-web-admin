<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Events Management</h2>
        <p class="text-sm text-gray-500 mt-1">Manage parties and events for your customers.</p>
      </div>
      <Button @click="$router.push('/Operation/events/creation')" class="bg-primary hover:bg-primary/90 text-white">
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
      <div class="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">No events found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new event or party.</p>
      <div class="mt-6">
        <Button @click="$router.push('/Operation/events/creation')" variant="outline">
          <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="event in events" :key="event.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          <img v-if="event.image_url" :src="event.image_url" :alt="event.title" class="object-cover w-full h-full" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="heroicons:photo" class="w-12 h-12 text-gray-300" />
          </div>
          <div class="absolute top-3 right-3">
            <Badge :variant="event.is_active ? 'default' : 'secondary'" class="shadow-sm font-medium">
              {{ event.is_active ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
        </div>
        <div class="p-5">
          <h3 class="text-lg font-bold text-gray-900 line-clamp-1 mb-1">{{ event.title }}</h3>
          <div class="flex items-center text-xs text-gray-500 mb-3 font-medium">
            <Icon name="heroicons:calendar" class="w-3.5 h-3.5 mr-1 text-primary" />
            {{ new Date(event.event_date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </div>
          <p class="text-sm text-gray-600 line-clamp-2 mb-5 h-10">{{ event.description }}</p>
          <div class="flex gap-2">
            <!-- Delete Button (Only implemented in UI for now) -->
            <Button variant="outline" class="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100" @click="deleteEvent(event.id)">
              <Icon name="heroicons:trash" class="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/store/AuthStore'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
const authStore = useAuthStore()
const { token } = useAuth()
const config = useRuntimeConfig()
const events = ref([])
const loading = ref(true)

const fetchEvents = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiUrl}/api/admin/events`, {
      headers: { Authorization: token.value }
    })
    events.value = response.events || []
  } catch (error) {
    console.error('Failed to fetch events', error)
  } finally {
    loading.value = false
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Are you sure you want to delete this event?')) return
  toast({ title: 'Info', description: 'Delete functionality is coming soon!' })
}

onMounted(() => {
  fetchEvents()
})
</script>
