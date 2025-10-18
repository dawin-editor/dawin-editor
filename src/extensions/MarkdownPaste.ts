import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

export const MarkdownPaste = Extension.create({
    name: 'markdownPaste',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('markdownPaste'),
                props: {
                    handlePaste: (_view, event) => {
                        const clipboardText = event.clipboardData?.getData('text/plain')

                        if (clipboardText) {
                            this.editor.commands.insertContent(clipboardText , {contentType: 'markdown'})
                            return true
                        }

                        return false
                    },
                },
            }),
        ]
    },
})