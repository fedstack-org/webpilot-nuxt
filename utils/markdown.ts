import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async'
import mk from '@vscode/markdown-it-katex'
import MarkdownItAsync from 'markdown-it-async'
import { codeToHtml } from 'shiki'

const md = MarkdownItAsync()
md.use(
  fromAsyncCodeToHtml(codeToHtml as never, {
    themes: {
      light: 'github-light',
      dark: 'github-dark'
    }
  })
)
md.use(mk)

export async function renderMarkdown(source: string) {
  return md.renderAsync(source)
}

export async function renderMarkdownText(source: string) {
  const rendered = await renderMarkdown(source)
  const div = document.createElement('div')
  div.innerHTML = rendered
  return div.textContent ?? ''
}
