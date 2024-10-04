import React, { useEffect } from 'react';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

function OnChangeParseHtmlPlugin({ setFieldvalue, name, parseHtml }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (parseHtml) {
            editor.update(() => {
                setFieldvalue(`${name}_html`, $generateHtmlFromNodes(editor, null));
            });
        }
    }, [editor]);
    return null;
}

export default OnChangeParseHtmlPlugin;
