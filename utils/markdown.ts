import MarkdownItAsync from 'markdown-it-async'
import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async'
import { codeToHtml } from 'shiki'
import mk from '@vscode/markdown-it-katex'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'

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
