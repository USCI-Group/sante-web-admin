<template>
    <div class="flex inline-block" :class="isAbsolute ? 'absolute' : 'relative'" @mouseenter="show = true" @mouseleave="show = false">
      <slot />
  
      <transition name="fade">
        <div
          v-if="show"
          class="absolute z-50 px-2 py-1 text-sm text-white bg-black rounded shadow-lg whitespace-nowrap"
          :class="positionClasses"
        >
          <div v-for="(line, index) in text.split('\n')" :key="index">
            {{ line }}
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    text: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: 'top', // top, bottom, left, right
    },
    isAbsolute: {
      type: Boolean,
      default: false
    }
  })
  
  const show = ref(false)
  
  const positionClasses = computed(() => {
    switch (props.position) {
      case 'bottom':
        return 'top-full mt-2 left-1/2 -translate-x-1/2'
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2'
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2'
      case 'top':
      default:
        return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
    }
  })
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  