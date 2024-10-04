import './style.css';
import ExampleTheme from './themes/ExampleTheme';
import { $getRoot, $getSelection } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import OnSavePlugin from './plugins/OnSavePlugin';
import OnLoadPlugin from './plugins/OnLoadPlugin';
import OnChangeParseHtmlPlugin from './plugins/OnChangeParseHtmlPlugin';

import CustomOnchangePlugin from './plugins/CustomOnchangePlugin';
import { ImageNode } from './nodes/ImageNode';
import ImagesPlugin from './plugins/InsertImagePlugin';
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

function Placeholder() {
    return <div className="editor-placeholder">Enter some rich text...</div>;
}

export default function Editor({
    value = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    setValue = () => {},
    setFieldValue = () => {},
    name = '',
    parseHtml = false,
    loading = false,
    ...props
}) {
    const editorConfig = {
        // The editor theme
        theme: ExampleTheme,
        // Handling of errors during update
        onError(error) {
            throw error;
        },
        // Any custom nodes go here
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode,
            ImageNode
        ]
    };

    return (
        <Box sx={{ px: 1, py: 0 }}>
            <LexicalComposer initialConfig={editorConfig}>
                <div className="editor-container">
                    <ToolbarPlugin />
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input" />}
                            placeholder={<Placeholder />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <CodeHighlightPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin />
                        <ListMaxIndentLevelPlugin maxDepth={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        {/* eslint-disable-next-line react/jsx-no-bind */}
                        <CustomOnchangePlugin setValue={setValue} setFieldValue={setFieldValue} parseHtml={parseHtml} name={name} />
                        {/* <OnSavePlugin /> */}
                        <ImagesPlugin />
                        <OnLoadPlugin value={value} loading={loading} />
                    </div>
                </div>
            </LexicalComposer>
        </Box>
    );
}
