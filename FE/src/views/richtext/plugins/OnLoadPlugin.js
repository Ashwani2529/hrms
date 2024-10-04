import React, { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@mui/material';
import { $getRoot, $createTextNode, $createParagraphNode } from 'lexical';

function OnLoadPlugin({ value, loading }) {
    const [editor] = useLexicalComposerContext();
    const [isFirstRender, setIsFirstRender] = React.useState(true);

    const loadContent = () => {
        if (value) {
            editor.update(() => {
                const parseEditorState = editor.parseEditorState(value);
                editor.setEditorState(parseEditorState);
            });
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setIsFirstRender(false);
        }, 500);
    }, []);

    useEffect(() => {
        loadContent();
    }, [loading, isFirstRender]);

    return null;
}

export default OnLoadPlugin;
