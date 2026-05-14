<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  imageUrl: string
  isOpen?: boolean
  contentType?: string
}>()

const emit = defineEmits(['update:isOpen'])

const dialogOpen = ref(props.isOpen ?? false)

function openDialog() {
  dialogOpen.value = true
  emit('update:isOpen', true)
}

function closeDialog() {
  dialogOpen.value = false
  emit('update:isOpen', false)
}
</script>

<template>
  <div
    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 cursor-zoom-in"
    @click="openDialog"
  >
    <span
      class="opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="11" cy="11" r="8" stroke-width="2" fill="none"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11a3 3 0 016 0"/>
      </svg>
      <span class="text-white text-xs">View</span>
    </span>
  </div>

  <Dialog :open="dialogOpen" @update:open="closeDialog">
    <DialogContent class="max-w-3xl w-full p-4 flex flex-col items-center bg-white rounded shadow-lg">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow"
        @click="closeDialog"
        type="button"
      >
      <span class="w-8 h-8 flex items-center justify-center bg-white rounded-full absolute top-0 right-0 border border-gray-400">
      </span>
      </button>
      <img
        v-if="contentType !== 'video'"
        :src="imageUrl"
        alt="Full Image"
        class="max-w-full max-h-[80vh] rounded"
      />
      <video
        v-if="contentType === 'video'"
        :src="imageUrl"
        alt="Full Video"
        class="max-w-full max-h-[80vh] rounded"
        controls
        controlsList="nodownload"
      />
    </DialogContent>
  </Dialog>
</template>
