<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Message {
  id: number
  text: string
  isDeleted: boolean
  createdAt: Date
}

const messages = ref<Message[]>([
  { id: 1, text: 'Сообщение 1', isDeleted: false, createdAt: new Date('2024-01-15T10:00:00') },
  { id: 2, text: 'Сообщение 2', isDeleted: false, createdAt: new Date('2024-01-15T10:05:00') },
  { id: 3, text: 'Сообщение 3', isDeleted: true, createdAt: new Date('2024-01-15T10:10:00') },
  { id: 4, text: 'Сообщение 4', isDeleted: false, createdAt: new Date('2024-01-15T10:15:00') },
  { id: 5, text: 'Сообщение 5', isDeleted: false, createdAt: new Date('2024-01-15T10:20:00') },
  { id: 6, text: 'Сообщение 6', isDeleted: false, createdAt: new Date('2024-01-15T10:25:00') },
])

const currentMessageIndex = ref(0)
const newMessageText = ref('')
let rotationInterval: NodeJS.Timeout

const activeMessages = () => messages.value.filter((msg) => !msg.isDeleted)

const getCurrentMessage = () => {
  const active = activeMessages()
  if (active.length === 0) return null
  return active[currentMessageIndex.value % active.length]
}

const deleteCurrentMessage = () => {
  const current = getCurrentMessage()
  if (current) {
    current.isDeleted = true
    nextMessage()
  }
}

const nextMessage = () => {
  const active = activeMessages()
  if (active.length > 0) {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % active.length
  }
}

const addNewMessage = () => {
  if (newMessageText.value.trim()) {
    const newMessage: Message = {
      id: Date.now(),
      text: newMessageText.value.trim(),
      isDeleted: false,
      createdAt: new Date(),
    }
    messages.value.push(newMessage)
    newMessageText.value = ''
  }
}

const formatDateTime = (date: Date) => {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  rotationInterval = setInterval(() => {
    nextMessage()
  }, 3000)
})

onUnmounted(() => {
  if (rotationInterval) {
    clearInterval(rotationInterval)
  }
})
</script>

<template>
  <div class="app-container container py-4">
    <div class="block-item row">
      <div class="col-12">
        <div class="card current-message-card rounded-3 mb-4">
          <div class="card-body d-flex align-items-center justify-content-between">
            <button
              v-if="getCurrentMessage()"
              @click="deleteCurrentMessage"
              class="btn btn-link text-secondary p-0 me-3"
              style="text-decoration: none"
            >
              <img src="@/assets/icons/delete.svg" alt="delete" />
            </button>
            <div class="flex-grow-1">
              <span v-if="getCurrentMessage()" class="fs-5">{{ getCurrentMessage()?.text }}</span>
              <span v-else class="text-muted">Нет доступных сообщений</span>
            </div>
          </div>
        </div>

        <div class="card mb-4 message-body">
          <div class="card-body message-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="d-flex align-items-center py-2"
            >
              <span v-if="message.isDeleted" class="text-danger me-2" style="font-size: 1.2rem">
                ×
              </span>
              <span v-else class="me-2" style="width: 1.2rem"></span>
              <div class="flex-grow-1">
                <div :class="{ 'text-muted': message.isDeleted }">
                  {{ message.text }}
                </div>
                <small class="text-muted">
                  {{ formatDateTime(message.createdAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-8 new-message-body">
            <label for="newMessage" class="custom-label form-label">Новое сообщение</label>
            <input
              id="newMessage"
              v-model="newMessageText"
              class="form-control py-3"
              rows="3"
              placeholder="Сообщение 1 2 3"
              @keydown.ctrl.enter="addNewMessage"
            />
          </div>
          <div class="col-12 col-md-4">
            <button
              @click="addNewMessage"
              class="send-button btn btn-success w-100 py-3"
              :disabled="!newMessageText.trim()"
            >
              ОТПРАВИТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-body {
  border: none !important;
  border-radius: 8px;
}

.send-button {
  background: linear-gradient(90deg, #04694b 0%, #11a87b 100%);
}

.new-message-body {
  position: relative;
}

.custom-label {
  position: absolute;
  top: -21%;
  left: 1rem;
  color: #8b939c;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  background: white;
  padding: 0 4px;
}
.current-message-card {
  background-color: #e4f0ed;
  border: none;
  padding: 0.5rem 0;
}

.message-list {
  background-color: #f8f9fa;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.app-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 665px;
}

.block-item {
  border-radius: 8px;
  width: 100%;
  box-shadow: 0px 5px 42px 0px #2123251f;
  padding: 3rem 2rem;
}

@media (max-width: 768px) {
  .block-item {
    padding: 1.5rem 0.5rem;
  }

  .app-container {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .container {
    padding: 0.5rem;
  }

  .card {
    border-radius: 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
  }
}
</style>
