<template>
  <div
    class="self-stretch bg-white px-4 py-2 rounded cursor-pointer shadow hover:shadow-md transition-300"
    @click="task._id && switchTask.execute(task._id)"
  >
    <div class="flex items-center space-x-4">
      <div class="flex-1 overflow-hidden text-nowrap text-ellipsis font-semibold">
        {{ task.title || $t('webpilot.msg.default_title') }}
      </div>
      <div>
        <NPopconfirm
          v-model:show="showDeleteConfirm"
          trigger="manual"
          @positive-click="deleteTask.execute(task as IAgentTaskContext)"
          @clickoutside="showDeleteConfirm = false"
        >
          <template #trigger>
            <NButton
              size="tiny"
              secondary
              type="error"
              :loading="deleteTask.loading.value"
              @click.stop.prevent="showDeleteConfirm = true"
            >
              <NIcon>
                <div class="i-carbon:trash-can" />
              </NIcon>
            </NButton>
          </template>
          {{ $t('webpilot.msg.delete_task_confirm') }}
        </NPopconfirm>
      </div>
    </div>
    <div class="flex">
      <div class="flex-1" />
      <div class="text-sm text-gray">{{ simpleFormatDate(task.updatedAt || 0) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NPopconfirm } from 'naive-ui'

defineProps<{
  task: Partial<IAgentTaskContext>
}>()
const { switchTask, deleteTask } = useCopilot()
const showDeleteConfirm = ref(false)
</script>
