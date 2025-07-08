import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from './App.vue'

vi.useFakeTimers()

describe('App.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(App)
  })

  describe('Инициализация компонента', () => {
    it('должен содержать начальные сообщения', () => {
      const messageItems = wrapper.findAll('.message-list .border-bottom')
      expect(messageItems.length).toBe(6)
    })

    it('должен показывать первое активное сообщение в блоке 1', () => {
      const currentMessage = wrapper.find('.current-message-card .fs-5')
      expect(currentMessage.text()).toBe('Сообщение 1')
    })
  })

  describe('Отображение сообщений', () => {
    it('должен показывать активные сообщения', () => {
      const activeMessages = wrapper
        .findAll('.message-list .border-bottom')
        .filter((item) => !item.find('.text-danger').exists())
      expect(activeMessages.length).toBe(5)
    })

    it('должен помечать удаленные сообщения знаком ×', () => {
      const deletedMessage = wrapper
        .findAll('.message-list .border-bottom')
        .find((item) => item.find('.text-danger').exists())
      expect(deletedMessage?.find('.text-danger').text()).toBe('×')
    })

    it('должен отображать дату создания сообщений', () => {
      const dateElements = wrapper.findAll('.message-list small.text-muted')
      expect(dateElements.length).toBeGreaterThan(0)
      expect(dateElements[0].text()).toMatch(/\d{2}\.\d{2}\.\d{4}/)
    })
  })

  describe('Удаление сообщений', () => {
    it('должен удалять текущее сообщение при нажатии на ×', async () => {
      const deleteButton = wrapper.find('.current-message-card button')
      expect(deleteButton.exists()).toBe(true)

      await deleteButton.trigger('click')
      await nextTick()

      const deletedMessages = wrapper.findAll('.message-list .text-danger')
      expect(deletedMessages.length).toBe(2)
    })

    it('должен переходить к следующему сообщению после удаления', async () => {
      const initialMessage = wrapper.find('.current-message-card .fs-5').text()
      const deleteButton = wrapper.find('.current-message-card button')

      await deleteButton.trigger('click')
      await nextTick()

      const newMessage = wrapper.find('.current-message-card .fs-5').text()
      expect(newMessage).not.toBe(initialMessage)
    })
  })

  describe('Автоматическая ротация', () => {
    it('должен переключаться на следующее сообщение через 3 секунды', async () => {
      const initialMessage = wrapper.find('.current-message-card .fs-5').text()

      vi.advanceTimersByTime(3000)
      await nextTick()

      const newMessage = wrapper.find('.current-message-card .fs-5').text()
      expect(newMessage).not.toBe(initialMessage)
    })

    it('должен циклически переключаться между сообщениями', async () => {
      const messages: string[] = []

      for (let i = 0; i < 6; i++) {
        messages.push(wrapper.find('.current-message-card .fs-5').text())
        vi.advanceTimersByTime(3000)
        await nextTick()
      }

      const uniqueMessages = [...new Set(messages)]
      expect(uniqueMessages.length).toBeLessThan(messages.length)
    })
  })

  describe('Добавление новых сообщений', () => {
    it('должен добавлять новое сообщение при заполненном поле', async () => {
      const textarea = wrapper.find('input')
      const button = wrapper.find('.btn-success')

      await textarea.setValue('Новое тестовое сообщение')
      await button.trigger('click')
      await nextTick()

      const messageItems = wrapper.findAll('.message-list .border-bottom')
      expect(messageItems.length).toBe(7)

      const lastMessage = messageItems[messageItems.length - 1]
      expect(lastMessage.text()).toContain('Новое тестовое сообщение')
    })

    it('должен очищать поле ввода после добавления', async () => {
      const textarea = wrapper.find('input')
      const button = wrapper.find('.btn-success')

      await textarea.setValue('Тест')
      await button.trigger('click')
      await nextTick()

      expect(textarea.element.value).toBe('')
    })

    it('должен блокировать кнопку при пустом поле', async () => {
      const button = wrapper.find('.btn-success')
      expect(button.attributes('disabled')).toBeDefined()

      const textarea = wrapper.find('input')
      await textarea.setValue('Текст')
      await nextTick()

      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('должен добавлять сообщение по Ctrl+Enter', async () => {
      const textarea = wrapper.find('input')

      await textarea.setValue('Сообщение через Ctrl+Enter')
      await textarea.trigger('keydown', {
        key: 'Enter',
        ctrlKey: true,
      })
      await nextTick()

      const messageItems = wrapper.findAll('.message-list .border-bottom')
      expect(messageItems.length).toBe(7)
    })

    it('не должен добавлять пустые сообщения', async () => {
      const textarea = wrapper.find('input')
      const button = wrapper.find('.btn-success')

      await textarea.setValue('   ')
      await button.trigger('click')
      await nextTick()

      const messageItems = wrapper.findAll('.message-list .border-bottom')
      expect(messageItems.length).toBe(6)
    })
  })
})
