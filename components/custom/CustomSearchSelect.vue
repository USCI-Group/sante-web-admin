<script setup lang="ts">
import { ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxLabel, ComboboxRoot, ComboboxSeparator, ComboboxTrigger, ComboboxViewport } from 'reka-ui'
import { Icon } from '@iconify/vue'
import type { Option } from '~/types/common'
const props = defineProps<{
  options: string[]
  placeholder?: string
}>()

</script>

<template>
  <ComboboxRoot
    class="relative"
  >
    <ComboboxAnchor class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate text-start">
      <ComboboxTrigger class="flex-1 flex items-center">
        <ComboboxInput
          class="!bg-transparent outline-none text-grass11 h-full w-full selection:bg-grass5 placeholder-stone-400"
          :placeholder="placeholder ?? 'Placeholder...'"
        />
        <Icon
          icon="radix-icons:chevron-down"
          class="h-4 w-4 text-grass11 ml-2 flex-shrink-0"
        />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent class="absolute z-10 w-full mt-1 min-w-[160px] bg-white overflow-hidden rounded-lg shadow-sm border will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
      <ComboboxViewport class="p-[5px]">
        <ComboboxEmpty class="text-mauve8 text-xs font-medium text-center py-2" />
        <ComboboxItem
          v-for="option in options"
          :key="option"
          :value="option"
          class="leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-grass9 data-[highlighted]:text-grass1 cursor-pointer"
        >
          <ComboboxItemIndicator
            class="absolute left-0 w-[25px] inline-flex items-center justify-center"
          >
            <Icon icon="radix-icons:check" />
          </ComboboxItemIndicator>
          <span>
            {{ option }}
          </span>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>