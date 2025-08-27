import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async'
import mk from '@vscode/markdown-it-katex'
import DOMPurify from 'dompurify'
import MarkdownItAsync from 'markdown-it-async'
import { codeToHtml } from 'shiki'

const md = MarkdownItAsync({ html: true })
md.use(
  fromAsyncCodeToHtml(codeToHtml as never, {
    themes: {
      light: 'github-light',
      dark: 'github-dark'
    }
  })
)
md.use(mk)
md.renderer.rules.paragraph_open = //
  md.renderer.rules.heading_open = (tokens, idx, options, env, slf) => {
    if (tokens[idx].map && tokens[idx].level === 0) {
      const line = tokens[idx].map[0]
      tokens[idx].attrSet('data-source-line', String(line))
    }
    return slf.renderToken(tokens, idx, options)
  }

export async function renderMarkdown(source: string) {
  const html = await md.renderAsync(source)
  return DOMPurify.sanitize(html)
}

export async function renderMarkdownText(source: string) {
  const rendered = await renderMarkdown(source)
  const div = document.createElement('div')
  div.innerHTML = rendered
  return div.textContent ?? ''
}
