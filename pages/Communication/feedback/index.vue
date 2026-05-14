<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { ColumnDef } from '@tanstack/vue-table'
import { ref } from "vue";
import draggable from "vuedraggable";
import CreateAnnouncementDialog from '@/components/custom/communication/CreateAnnouncementDialog.vue'
import type { Onboarding, Announcement, FeedbackQuestion } from '@/types/communication';
import DynamicDialog from '@/components/custom/DynamicDialog.vue';
import { useToast } from '~/components/ui/toast/use-toast'
import type { Meta } from '@/types/common';
import DynamicTable from '@/components/custom/DynamicTable.vue';
import CreateFeedbackDialog from '@/components/custom/communication/CreateFeedbackDialog.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const { getMe, me } = useUsers()
const { updateAnnouncement, queryFeedbackQuestionWithFilters, deleteFeedbackQuestion, updateFeedbackQuestion } = useCommunication();
const { toast } = useToast();

const feedbackQuestionCards = ref<FeedbackQuestion[]>([]);
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1,
});

const feedbackQuestionDialog = ref({
  isOpen: false,
  isLoading: false,
  mode: 'create' as 'create' | 'edit',
  feedbackQuestion: {} as FeedbackQuestion,
  sections: ['service', 'product', 'delivery', 'other']
});

const search = ref('');
const dateFilter = ref<Date>();

const businessId = ref<string>('');

const deleteDialog = ref({
    isOpen: false,
    title: 'Delete Feedback Question',
    description: 'Are you sure you want to delete this feedback question?',
    confirmationText: 'Delete',
    showConfirmationInput: true,
    feedbackQuestion: {} as FeedbackQuestion,
    isLoading: false
});

const feedbackQuestionColumns: ColumnDef<FeedbackQuestion, any>[] = [
  {
    id: 'question',
    header: 'Question',
    accessorKey: 'question',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-4' }, [
      row.original.image_url
        ? h('img', {
            src: row.original.image_url,
            alt: 'Question Image',
            class: 'w-16 h-16 object-cover rounded'
          })
        : null,
      h('span', { class: 'text-right' }, row.original.question)
    ]),
  },  
  {
    id: 'section',
    header: 'Section',
    accessorKey: 'section',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-4' }, [
      h('span', { class: 'capitalize' }, row.original.section)
    ]),
  },
  {
    id: 'created_at',
    header: 'Date Created',
    accessorKey: 'created_at',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-4' }, [
      h('span', { class: 'capitalize' }, new Date(row.original.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur'
      }).replace(/ /, ' '))
    ]),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2 items-center' }, [
      h(Switch, {
        modelValue: row.original.is_active,
        checked: row.original.is_active,
        'onUpdate:checked': () => handleToggleActive(row.original),
      }),
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => openFeedbackQuestionDialog(row.original),
      }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => openDeleteDialog(row.original),
      }, () => h(Icon, { icon: 'heroicons:trash' }))
    ])
  }
]

onMounted(async () => {
    await getMe();
    businessId.value = me.value?.business_id || '';
    await getFeedbackQuestionList();
})

let debounceTimer: any = null
watch(search, (newVal: string) => {
  clearTimeout(debounceTimer)
  meta.value.page = 1;
  
  debounceTimer = setTimeout(() => {
    getFeedbackQuestionList()
  }, 500) // Delay in milliseconds
})

watch(dateFilter, () => {
    getFeedbackQuestionList()
})

const openFeedbackQuestionDialog = (feedbackQuestion?: FeedbackQuestion) => {
    if (feedbackQuestion) {
        feedbackQuestionDialog.value.mode = 'edit';
        feedbackQuestionDialog.value.feedbackQuestion = feedbackQuestion;
        feedbackQuestionDialog.value.feedbackQuestion.section = feedbackQuestionDialog.value.feedbackQuestion.section.charAt(0).toUpperCase() + feedbackQuestionDialog.value.feedbackQuestion.section.slice(1);
    } else {
        feedbackQuestionDialog.value.mode = 'create';
        feedbackQuestionDialog.value.feedbackQuestion = {
            is_active: true,
            business_id: businessId.value,
        } as FeedbackQuestion;
    }

    const allSections = feedbackQuestionCards.value.map((item) => item.section);
    feedbackQuestionDialog.value.sections.push(...allSections);
    feedbackQuestionDialog.value.sections = feedbackQuestionDialog.value.sections.map((section) => section.charAt(0).toUpperCase() + section.slice(1));
    feedbackQuestionDialog.value.sections = [...new Set(feedbackQuestionDialog.value.sections)];

    feedbackQuestionDialog.value.isOpen = true;
}

const getFeedbackQuestionList = async () => {
    const body:any = {
        business_id: businessId.value,
        page: meta.value.page,
        page_size: meta.value.page_size,
    }
    if(search.value){
        body.search = search.value
    }
    if(dateFilter.value){
        body.date_filter = dateFilter.value
    }
    try {
        const response = await queryFeedbackQuestionWithFilters(body);
        feedbackQuestionCards.value = response.feedback_question_list;
        meta.value = response.meta;
    } catch (error) {
        console.error(error);
    }
}

const handleToggleActive = async (feedbackQuestion: FeedbackQuestion) => {
    feedbackQuestion.is_active = !feedbackQuestion.is_active;
    await updateFeedbackQuestion({
      feedback_question_id: feedbackQuestion.id,
      is_active: feedbackQuestion.is_active,
      question: feedbackQuestion.question,
      section: feedbackQuestion.section,
    });
}

const openDeleteDialog = (feedbackQuestion: FeedbackQuestion) => {
    deleteDialog.value.isOpen = true;
    deleteDialog.value.feedbackQuestion = feedbackQuestion;
    deleteDialog.value.title = 'Delete Feedback Question';
    deleteDialog.value.description = `Do you want to delete this feedback question?`;
    deleteDialog.value.confirmationText = 'DELETE FEEDBACK QUESTION';
    deleteDialog.value.showConfirmationInput = true;
}

const deleteFeedbackQuestionFunction = async (data: any) => {
    const confirmation = data as string
    if(confirmation != deleteDialog.value.confirmationText){
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }
    try {
        await deleteFeedbackQuestion(deleteDialog.value.feedbackQuestion.id);
        toast({
            title: 'Success',
            description: 'Feedback question deleted successfully',
            variant: 'success',
        })
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to delete feedback question',
            variant: 'destructive',
        })
    }
    await getFeedbackQuestionList();
    deleteDialog.value.isOpen = false;
}

const handlePageSizeChange = (pageSize: number) => {
    meta.value.page_size = pageSize;
    getFeedbackQuestionList();
}

const handlePageChange = (page: number) => {
    meta.value.page = page;
    getFeedbackQuestionList();
}
</script>

<template>
<div class="w-full h-full">
    <div class="bg-white shadow border-t py-4 px-10 mt-2 z-10 relative">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <NuxtLink to="/">
                            <p class="text-md">Home</p>
                        </NuxtLink>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <p class="text-md text-gray-500">Communication Settings</p>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <p class="text-md text-primary font-semibold">Feedback</p>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    </div>

    <div class="py-6 px-12 bg-gray-100 min-h-screen">
        <div class="bg-white rounded-lg p-4 flex flex-col gap-4">
            <!-- Header title of page -->
            <div class="flex items-center justify-between w-full gap-4">
                <p class="text-lg ml-3">
                    Feedback
                </p>
                <div class="flex items-center gap-2">
                    <!-- <button v-if="!isDraggable" class="btn-primary flex items-center gap-2" @click="isDraggable = !isDraggable" type="button">
                        <Icon icon="heroicons:bars-4" class="w-5 h-5" />
                        Arrange Order
                    </button>
                    <button
                        v-if="isDraggable"
                        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-all duration-200"
                        @click="isDraggable = !isDraggable"
                        type="button"
                    >
                        Save
                    </button> -->
                    <button class="btn-primary flex items-center gap-2" type="button" @click="openFeedbackQuestionDialog()">
                        <Icon icon="heroicons:plus" class="w-5 h-5" />
                        Create Feedback
                    </button>
                </div>
            </div>

            <div>
                <div class="border-t border-dashed border-gray-300"></div>
                <div class="flex items-center gap-2 w-full my-2">
                    <div class="relative w-full">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Icon icon="heroicons:magnifying-glass" class="w-5 h-5" />
                        </span>
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search by feedback..."
                            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-full transition"
                        />
                    </div>

                    <div class="w-1/4">
                        <VueDatePicker 
                            v-model="dateFilter"
                            :enable-time-picker="false"
                            placeholder="Filter by date created"
                      />
                    </div>
                </div>
                <div class="border-t border-dashed border-gray-300"></div>
            </div>

            <DynamicTable 
                :columns="feedbackQuestionColumns" 
                :data="feedbackQuestionCards" 
                :currentPage="meta.page"
                :totalPages="meta.total_pages"
                @pageSizeChange="handlePageSizeChange"
                @pageChange="handlePageChange"
                :disable-toolbar="true"
            >
                <template #toolbar-buttons>
                    
                </template> 
            </DynamicTable>
        </div>

    </div>

    <CreateFeedbackDialog
      :isOpen="feedbackQuestionDialog.isOpen"
      :isLoading="feedbackQuestionDialog.isLoading"
      :businessId="businessId"
      :mode="feedbackQuestionDialog.mode"
      :feedbackQuestion="feedbackQuestionDialog.feedbackQuestion"
      :sections="feedbackQuestionDialog.sections"
      @update:isOpen="feedbackQuestionDialog.isOpen = $event"
      @cancel="getFeedbackQuestionList"
      @submit="getFeedbackQuestionList"
    />
    
    <DynamicDialog
      :isOpen="deleteDialog.isOpen"
      :title="deleteDialog.title"
      :description="deleteDialog.description"
      :confirmationText="deleteDialog.confirmationText"
      :showConfirmationInput="deleteDialog.showConfirmationInput"
      @cancel="deleteDialog.isOpen = false"
      @confirm="deleteFeedbackQuestionFunction"
    />

</div>
</template>
