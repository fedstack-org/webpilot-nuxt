<template>
  <div class="px-4 h-16 min-h-16 max-h-16 flex items-center space-x-2">
    <div class="i-fa6-brands:internet-explorer text-lg inline-block mb-[-0.15rem]" />
    <h1 class="flex-1 text-lg overflow-hidden text-nowrap text-ellipsis">
      {{ taskContext.title || $t('webpilot.name') }}
    </h1>
    <NPopconfirm
      trigger="click"
      placement="bottom"
      :show-icon="false"
      @positive-click="summarizeTask.execute()"
    >
      <template #trigger>
        <NButton secondary circle class="!h-8 !w-8" :loading="summarizeTask.loading.value">
          <template #icon>
            <NIcon>
              <div class="i-simple-icons:googlegemini" />
            </NIcon>
          </template>
        </NButton>
      </template>
      {{ $t('webpilot.msg.summarize_task_confirm') }}
    </NPopconfirm>
    <NPopconfirm
      v-model:show="showEditPopup"
      trigger="manual"
      placement="bottom"
      :show-icon="false"
      @positive-click="applyTitle"
      @clickoutside="showEditPopup = false"
    >
      <template #trigger>
        <NButton
          secondary
          circle
          class="!h-8 !w-8"
          :loading="saveTask.loading.value"
          @click="toggleEditPopup"
        >
          <template #icon>
            <NIcon>
              <div class="i-carbon:edit" />
            </NIcon>
          </template>
        </NButton>
      </template>
      <div>
        <div class="text-center text-sm font-bold pb-2">
          {{ $t('webpilot.msg.edit_task_title') }}
        </div>
        <NInput v-model:value="newTitle" type="textarea" />
      </div>
    </NPopconfirm>
    <NButton
      secondary
      circle
      class="!h-8 !w-8"
      :disabled="newTask.loading.value"
      @click="newTask.execute()"
    >
      <template #icon>
        <NIcon>
          <div class="i-carbon:add-comment" />
        </NIcon>
      </template>
    </NButton>
    <NButton v-if="showClose" circle class="!h-8 !w-8" @click="show = false">
      <template #icon>
        <NIcon>
          <div class="i-carbon:close" />
        </NIcon>
      </template>
    </NButton>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NInput, NPopconfirm } from 'naive-ui'

defineProps<{ showClose?: boolean }>()
const { show, newTask, saveTask, summarizeTask, taskContext } = useCopilot()
const showEditPopup = ref(false)
const newTitle = ref('')

const toggleEditPopup = () => {
  showEditPopup.value = true
  newTitle.value = taskContext.value.title || ''
}

const applyTitle = () => {
  taskContext.value.title = newTitle.value
  saveTask.execute()
}
</script>
