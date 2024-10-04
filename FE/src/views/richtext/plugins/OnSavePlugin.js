import React, { useState } from 'react';
import { $getRoot, $getSelection } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@mui/material';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { editorStyle } from './style';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function OnSavePlugin() {
    const [content, setContent] = useState('');
    const [editor] = useLexicalComposerContext();

    const onConvertToPDF = () => {
        console.log(content);
        const pdfContent = htmlToPdfmake(`<style>${editorStyle}</style>${content}`);
        const documentDefinition = { content: pdfContent };
        pdfMake.createPdf(documentDefinition).download('document.pdf');
    };

    const onSave = () => {
        editor.update(() => {
            setContent($generateHtmlFromNodes(editor, null));
            // localStorage.setItem('editorState', JSON.stringify($generateHtmlFromNodes(editor, null)));
        });

        onConvertToPDF();
    };

    return <Button onClick={onSave}>Get Content</Button>;
}

export default OnSavePlugin;
