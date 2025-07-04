import presetIcons from '@unocss/preset-icons'
import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      collections: {
        webpilot: {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><!-- Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE --><path fill="currentColor" d="m10.878.282l.348 1.071a2.2 2.2 0 0 0 1.398 1.397l1.072.348l.021.006a.423.423 0 0 1 0 .798l-1.071.348a2.2 2.2 0 0 0-1.399 1.397l-.348 1.07a.423.423 0 0 1-.798 0l-.348-1.07a2.2 2.2 0 0 0-1.399-1.403l-1.072-.348a.423.423 0 0 1 0-.798l1.072-.348a2.2 2.2 0 0 0 1.377-1.397l.348-1.07a.423.423 0 0 1 .799 0m4.905 7.931l-.765-.248a1.58 1.58 0 0 1-1-.999l-.248-.764a.302.302 0 0 0-.57 0l-.25.764a1.58 1.58 0 0 1-.983.999l-.765.248a.303.303 0 0 0 0 .57l.765.249a1.58 1.58 0 0 1 1 1.002l.248.764a.302.302 0 0 0 .57 0l.249-.764a1.58 1.58 0 0 1 .999-.999l.765-.248a.303.303 0 0 0 0-.57zm-3.507 2.936q.136.345.426.579A5.99 5.99 0 0 1 8 14a6 6 0 0 1-3.004-.805l-2.338.78a.5.5 0 0 1-.639-.612l.712-2.491A6 6 0 0 1 7.307 2.04l-.356.114c-.28.1-.52.28-.69.52a1.4 1.4 0 0 0-.259.741A5 5 0 0 0 3.7 10.552a.5.5 0 0 1 .051.393l-.509 1.78l1.658-.552a.5.5 0 0 1 .426.052C6.1 12.715 7.015 13 8 13a5 5 0 0 0 4.156-2.22z"/></svg>'
        }
      }
    })
  ]
})
