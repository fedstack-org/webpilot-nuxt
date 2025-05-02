<template>
  <NScrollbar content-class="overflow-hidden h-full flex flex-col items-stretch" class="flex-1">
    <div v-if="!tasks.data.value.length" class="flex-1 flex flex-col items-center justify-center">
      <div>{{ $t('webpilot.msg.no_recent_tasks') }}</div>
    </div>
    <div v-else-if="showAllTasks" class="flex-1 flex flex-col items-center gap-2 m-4">
      <div class="self-stretch flex items-center">
        <div class="flex-1 flex justify-start">
          <NButton size="small" @click="showAllTasks = false">
            <template #icon>
              <NIcon>
                <div class="i-carbon:chevron-left" />
              </NIcon>
            </template>
          </NButton>
        </div>
        {{ $t('webpilot.msg.all_tasks') }}
        <div class="flex-1 flex justify-end">
          <NButton
            size="small"
            type="error"
            :loading="clearTasks.loading.value"
            @click="clearTasks.execute()"
          >
            <NIcon>
              <div class="i-carbon:trash-can" />
            </NIcon>
          </NButton>
        </div>
      </div>
      <CopilotTask v-for="task in tasks.data.value" :key="task._id" :task />
    </div>
    <div v-else class="flex-1 flex flex-col items-center gap-2 m-4">
      <div>{{ $t('webpilot.msg.recent_tasks') }}</div>
      <CopilotTask v-for="task in recentTasks" :key="task._id" :task />
      <NButton size="small" @click="showAllTasks = true">
        {{ $t('webpilot.msg.show_all_tasks') }}
      </NButton>
    </div>
  </NScrollbar>
</template>

<script setup lang="ts">
import { NButton, NIcon, NScrollbar } from 'naive-ui'

const showAllTasks = ref(false)
const { tasks, recentTasks, clearTasks } = useCopilot()
</script>
