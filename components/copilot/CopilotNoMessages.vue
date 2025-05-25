<template>
  <NScrollbar content-class="overflow-hidden h-full flex flex-col items-stretch" class="flex-1">
    <div v-if="!tasks.data.value.length" class="flex-1 flex items-center justify-center">
      <div>{{ $t('webpilot.msg.no_recent_tasks') }}</div>
    </div>
    <div v-else class="h-0 flex-1 flex flex-col items-center space-y-2 my-4">
      <div class="self-stretch flex items-center mx-4">
        <div class="flex-1 flex justify-start">
          <NButton size="small" @click="showAllTasks = !showAllTasks">
            <template #icon>
              <NIcon>
                <div :class="showAllTasks ? 'i-carbon:chevron-left' : 'i-carbon:list-boxes'" />
              </NIcon>
            </template>
          </NButton>
        </div>
        {{ $t(showAllTasks ? 'webpilot.msg.all_tasks' : 'webpilot.msg.recent_tasks') }}
        <div class="flex-1 flex justify-end">
          <NPopconfirm @positive-click="clearTasks.execute()">
            <template #trigger>
              <NButton size="small" type="error" :loading="clearTasks.loading.value">
                <NIcon>
                  <div class="i-carbon:trash-can" />
                </NIcon>
              </NButton>
            </template>
            {{ $t('webpilot.msg.clear_tasks_confirm') }}
          </NPopconfirm>
        </div>
      </div>
      <NScrollbar class="w-0 min-w-full h-0 flex-1" content-class="space-y-2 px-4 py-2">
        <CopilotTask
          v-for="task in showAllTasks ? tasks.data.value : recentTasks"
          :key="task._id"
          :task
        />
        <div v-if="!showAllTasks" class="flex justify-center">
          <NButton size="small" @click="showAllTasks = true">
            {{ $t('webpilot.msg.show_all_tasks') }}
          </NButton>
        </div>
      </NScrollbar>
    </div>
  </NScrollbar>
</template>

<script setup lang="ts">
import { NButton, NIcon, NPopconfirm, NScrollbar } from 'naive-ui'

const showAllTasks = ref(false)
const { tasks, recentTasks, clearTasks } = useCopilot()
</script>
