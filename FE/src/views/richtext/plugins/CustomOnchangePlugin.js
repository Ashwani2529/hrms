import React from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

function CustomOnchangePlugin({ setValue, setFieldValue, name, parseHtml }) {
    const [editor] = useLexicalComposerContext();
    function onEditorUpdate(editorState) {
        setValue(JSON.stringify(editorState));
        if (parseHtml) {
            editor.update(() => {
                setFieldValue(`${name}_html`, `<div style="padding:10px;">${$generateHtmlFromNodes(editor, null)}</div>`);
            });
        }
    }
    // eslint-disable-next-line react/jsx-no-bind
    return <OnChangePlugin onChange={onEditorUpdate} />;
}

export default CustomOnchangePlugin;
