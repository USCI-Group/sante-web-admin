<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
    editLabel: {
        type: String,
        required: true
    },
    deleteLabel: {
        type: String,
        required: true
    },
    editAction: {
        type: Function as PropType<(e: MouseEvent) => void>,
        required: true
    },
    deleteAction: {
        type: Function as PropType<(e: MouseEvent) => void>,
        required: true
    }
})

</script>

<template>
    <div 
        class="w-56 p-2.5 bg-white rounded-xl shadow-[0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] inline-flex flex-col justify-center items-start
        border border-[#E9EAEB]
    ">
        <!-- <div class="self-stretch p-2.5 inline-flex justify-center items-center gap-2.5 hover:bg-[#FFF4ED] text-[#FF4405] cursor-pointer " @click="editAction">
            <div class="justify-start text-xs font-normal leading-none">{{ editLabel }}</div>
        </div> -->
        <div class="self-stretch p-2.5 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-[#FFF4ED] text-[#FF4405] cursor-pointer" @click="deleteAction">
            <div class="flex-1 text-center justify-start text-xs font-normal leading-none">{{ deleteLabel }}</div>
        </div>
    </div>
</template>