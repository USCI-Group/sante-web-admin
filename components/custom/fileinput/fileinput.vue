<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CloudUpload, Paperclip } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

const props = defineProps({
  keyId: {
    type: String,
    default: 'fileInput'
  },
  label: {
    type: String,
    default: 'Select File'
  },
  maxFiles: {
    type: Number,
    default: 5
  },
  maxSize: {
    type: Number,
    default: 1024 * 1024 *100
  },
  multiple: {
    type: Boolean,
    default: true
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  previewUrls: {
    type: String,
    default: ''
  },
  onSubmit: {
    type: Function,
    default: () => {}
  },
  isSubmitButton: {
    type: Boolean,
    default: true
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  allowedTypes: {
    type: Array,
    default: ['image/png', 'image/jpg', 'image/jpeg']
  }
})

const emit = defineEmits([
  'selected-files'
])

const formSchema = z.object({
  files: z.array(z.any()).optional()
})

const { handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(formSchema),
})

const files = ref<File[]>([])
const isDragging = ref(false)

watch(files, (newFiles) => {
  emit('selected-files', newFiles)
})

const dropZoneConfig = {
  maxFiles: props.maxFiles,
  maxSize: props.maxSize,
  multiple: props.multiple,
  accept: props.accept
}

const onFileChange = (fileList: FileList | null) => {
  if (!fileList) return
  
  const newFiles = Array.from(fileList)
    .filter(file => {
      const fileType = file.type
      const isValidType = fileType.startsWith('image/')
      const isValidSize = file.size <= dropZoneConfig.maxSize
      
      const isVideoAllowed = props.allowedTypes.some((type: unknown) => typeof type === 'string' ? type.startsWith('video/') : false)
      const isValidVideo = fileType.startsWith('video/') && isVideoAllowed
      
      if (!isValidType && !isVideoAllowed) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file`,
          variant: 'destructive'
        })
      }

      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds ${dropZoneConfig.maxSize / 1024 / 1024}MB limit`,
          variant: 'destructive'
        })
      }
      
      const allowedTypes = props.allowedTypes;
      var typeString = allowedTypes.join(', ')
      typeString = typeString.replace(/image\//g, '').replace(/,([^,]*)$/, ' or $1')
      typeString = typeString.toUpperCase()
      
      if (!allowedTypes.includes(fileType)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a ${typeString} file`,
          variant: 'destructive'
        })
        return false
      }

      return (isValidType || isValidVideo) && isValidSize
    })
    .slice(0, dropZoneConfig.maxFiles - files.value.length)
  
  files.value = [...files.value, ...newFiles]
  setFieldValue('files', files.value)
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  onFileChange(e.dataTransfer?.files || null)
}

const onSubmit = handleSubmit((values) => {
  try {
    toast({
      title: 'Files uploaded',
      description: `${files.value.length} files uploaded successfully`,
    })
  } catch (error) {
    console.error("Upload error", error)
    toast({
      title: 'Upload failed',
      description: 'Failed to upload files. Please try again.',
      variant: 'destructive',
    })
  }
})
</script>

<template>
  <form @submit.prevent="props.onSubmit()" class="space-y-8" :class="{ 'max-w-3xl mx-auto py-10': !props.fullWidth }">
    <FormField name="files" v-slot="{ errorMessage }">
      <FormItem>
        <!-- <FormLabel>{{ label }}</FormLabel> -->
        <FormControl>
          <div class="relative bg-background rounded-lg p-2">
            <input
              type="file"
              :id="props.keyId"
              class="hidden"
              @change="(e) => onFileChange((e.target as HTMLInputElement).files)"
              :multiple="dropZoneConfig.multiple"
              :accept="dropZoneConfig.accept"
            />
            <label
              :for="props.keyId"
               class="rounded-lg outline-dashed outline-2 flex items-center justify-center flex-col p-8 w-full cursor-pointer transition-colors"
              :class="{
                'outline-2 outline-primary bg-primary/5': isDragging,
                'outline-[#E9EAEB]': !isDragging
              }"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <div class="w-10 h-10 flex border border-[#E9EAEB] items-center justify-center rounded-lg overflow-hidden">
                <CloudUpload class="w-5 h-5" :class="{
                    'text-primary': isDragging,
                    'text-gray-500': !isDragging
                }" />

              </div>
              <p class="mb-1 text-sm" :class="{
                'text-primary': isDragging,
                'text-gray-500 dark:text-gray-400': !isDragging
              }">
                <span class="font-semibold">Click to upload</span>
                &nbsp; or drag and drop
              </p>
              <p class="text-xs" :class="{
                'text-primary': isDragging,
                'text-gray-500 dark:text-gray-400': !isDragging
              }">
                {{ allowedTypes && allowedTypes.length > 0 
                  ? allowedTypes
                      .map((type: unknown) => typeof type === 'string' ? type.replace('image/', '').toUpperCase() : '')
                      .filter(Boolean)
                      .join(', ')
                      .replace(/,([^,]*)$/, ' or $1')
                  : 'SVG, PNG, JPG or GIF' 
                }} (max {{ maxSize / 1024 / 1024 }}MB)
              </p>
            </label>
            <div class="mt-4 space-y-2">
              <!-- preview urls only if exists -->
              <div
                v-if="previewUrls && previewUrls.length > 0 && files.length === 0"
                class="flex items-center gap-2 p-2 border rounded"
              >
                <Paperclip class="h-4 w-4 stroke-current" />
                <span class="text-sm">{{ previewUrls.split('/').at(-1) }}</span>
                <span class="text-xs text-gray-500 ml-auto">
                  
                </span>
              </div>
              <!-- preview files only if not exists -->
              <div
                v-if="files.length > 0"
                v-for="(file, i) in files"
                :key="i"
                class="flex items-center gap-2 p-2 border rounded"
              >
                <Paperclip class="h-4 w-4 stroke-current" />
                <span class="text-sm">{{ file.name }}</span>
                <span class="text-xs text-gray-500 ml-auto">
                  {{ (file.size / 1024 / 1024).toFixed(2) }}MB
                </span>
                <button
                  type="button"
                  class="text-red-500 hover:text-red-700"
                  @click="files.splice(i, 1)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </FormControl>
        <FormDescription>Select files to upload (max {{ maxFiles }} files)</FormDescription>
        <FormMessage>{{ errorMessage }}</FormMessage>
      </FormItem>
    </FormField>
    <Button v-if="props.isSubmitButton" type="submit" :disabled="files.length === 0">Submit</Button>
  </form>
</template>
