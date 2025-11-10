import React, {useCallback, useMemo, useRef, useState} from 'react';
import {createEditor, Descendant, Editor, Transforms, Element as SlateElement} from 'slate';
import type {BaseEditor} from 'slate';
import {Slate, Editable, withReact, ReactEditor} from 'slate-react';
import type {HistoryEditor} from 'slate-history';
import {withHistory} from 'slate-history';

type CustomElement = { type: string; children: Descendant[] };
type CustomText = { text: string; bold?: boolean; italic?: boolean };
declare module 'slate' {
    interface CustomTypes {
        // 使用基础编辑器类型与 React/History 增强的交叉类型，避免在声明中自引用 Index
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

function Toolbar({editor}: { editor: Editor }) {
    const isMarkActive = (mark: keyof CustomText) => {
        const [match] = Array.from(Editor.nodes(editor, {
            match: n => typeof n === 'object' && (n as any)[mark] === true,
            universal: true,
        }));
        return !!match;
    };
    const toggleMark = (mark: keyof CustomText) => {
        const active = isMarkActive(mark);
        if (active) Editor.removeMark(editor, mark);
        else Editor.addMark(editor, mark, true);
    };
    const isBlockActive = (format: string) => {
        const [match] = Array.from(Editor.nodes(editor, {
            match: n => SlateElement.isElement(n) && (n as any).type === format,
        }));
        return !!match;
    };
    const toggleBlock = (format: string) => {
        const isActive = isBlockActive(format);
        const isList = LIST_TYPES.includes(format);

        Transforms.unwrapNodes(editor, {
            match: n => SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type),
            split: true,
        });

        let newType: string = 'paragraph';
        let wrapper: any = undefined;
        if (!isActive) {
            if (isList) {
                newType = 'list-item';
                wrapper = {type: format, children: []};
            } else if (format.startsWith('heading-')) {
                newType = format;
            } else {
                newType = format;
            }
        }
        Transforms.setNodes(editor, {type: newType} as any);
        if (wrapper) {
            Transforms.wrapNodes(editor, wrapper);
        }
    };

    const btn = (label: string, onClick: () => void, active = false) => (
        <button onClick={onClick}
                className={`px-2 py-1 text-xs rounded border bg-white border-gray-200 hover:bg-gray-50 dark:bg-black/20 dark:border-white/15 dark:text-gray-200 ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'text-gray-700'}`}>{label}</button>
    );

    return (
        <div className="mb-3 flex items-center gap-2">
            {btn('H1', () => toggleBlock('heading-1'), isBlockActive('heading-1'))}
            {btn('H2', () => toggleBlock('heading-2'), isBlockActive('heading-2'))}
            {btn('H3', () => toggleBlock('heading-3'), isBlockActive('heading-3'))}
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"/>
            {btn('加粗', () => toggleMark('bold'), isMarkActive('bold'))}
            {btn('斜体', () => toggleMark('italic'), isMarkActive('italic'))}
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"/>
            {btn('项目符号', () => toggleBlock('bulleted-list'), isBlockActive('bulleted-list'))}
            {btn('编号列表', () => toggleBlock('numbered-list'), isBlockActive('numbered-list'))}
        </div>
    );
}

const Element = ({attributes, children, element}: any) => {
    switch (element.type) {
        case 'heading-1':
            return <h1 {...attributes} className="text-2xl font-bold leading-tight">{children}</h1>;
        case 'heading-2':
            return <h2 {...attributes} className="text-xl font-bold leading-snug">{children}</h2>;
        case 'heading-3':
            return <h3 {...attributes} className="text-lg font-semibold leading-snug">{children}</h3>;
        case 'bulleted-list':
            return <ul {...attributes} className="list-disc pl-6">{children}</ul>;
        case 'numbered-list':
            return <ol {...attributes} className="list-decimal pl-6">{children}</ol>;
        case 'list-item':
            return <li {...attributes}>{children}</li>;
        default:
            return <p {...attributes} className="leading-relaxed">{children}</p>;
    }
};

const Leaf = ({attributes, children, leaf}: any) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    return <span {...attributes}>{children}</span>;
};

export default function Editor(): React.ReactElement {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const initialValue: Descendant[] = useMemo(() => ([{type: 'paragraph', children: [{text: ''}]}]), []);
    const [value, setValue] = useState<Descendant[]>(initialValue);

    const [slashOpen, setSlashOpen] = useState(false);
    const [slashRect, setSlashRect] = useState<{ left: number; top: number } | null>(null);

    const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === '/' && !slashOpen) {
            const domSel = window.getSelection();
            const range = domSel && domSel.rangeCount > 0 ? domSel.getRangeAt(0) : null;
            const rect = range?.getBoundingClientRect();
            if (rect) {
                const host = (event.target as HTMLElement).closest('[data-slate-host]') as HTMLElement | null;
                const base = host?.getBoundingClientRect();
                if (base) setSlashRect({left: (rect.left - base.left), top: (rect.bottom - base.top) + 8});
            }
            setSlashOpen(true);
        }
        if (event.key === 'Escape' && slashOpen) {
            setSlashOpen(false);
        }
    }, [slashOpen]);

    const insertHeading = (level: 1 | 2 | 3) => {
        const type = `heading-${level}`;
        Transforms.setNodes(editor, {type} as any);
    };
    const toggleList = (type: 'bulleted-list' | 'numbered-list') => {
        const isActive = Array.from(Editor.nodes(editor, {match: n => SlateElement.isElement(n) && (n as any).type === type})).length > 0;
        if (isActive) {
            Transforms.unwrapNodes(editor, {match: n => SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type)});
            Transforms.setNodes(editor, {type: 'paragraph'} as any);
        } else {
            Transforms.wrapNodes(editor, {type, children: []} as any);
            Transforms.setNodes(editor, {type: 'list-item'} as any);
        }
        setSlashOpen(false);
    };

    // 左侧悬浮控件（+ 与六点）
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [hoverRect, setHoverRect] = useState<{ top: number; left: number; height: number } | null>(null);
    const [hoverNode, setHoverNode] = useState<Node | null>(null);
    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        const el = target?.closest('p, h1, h2, h3, ul, ol, li') as HTMLElement | null;
        if (!el) {
            setHoverRect(null);
            setHoverNode(null);
            return;
        }
        const wr = wrapperRef.current?.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        if (!wr) return;
        setHoverRect({top: r.top - wr.top, left: r.left - wr.left, height: r.height});
        // 通过 DOM 定位到 Slate node
        try {
            const slateNode = ReactEditor.toSlateNode(editor, el);
            setHoverNode(slateNode as any);
        } catch {
            setHoverNode(null);
        }
    };
    const onMouseLeave = () => {
        setHoverRect(null);
        setHoverNode(null);
    };

    const focusAtHover = () => {
        if (!hoverNode) return;
        const dom = ReactEditor.toDOMNode(editor, hoverNode as any);
        const point = ReactEditor.findPath(editor, hoverNode as any);
        try {
            const range = Editor.range(editor, point);
            Transforms.select(editor, range);
        } catch {
        }
    };

    return (
        <div className="mx-auto">
            <Toolbar editor={editor}/>
            <div className="relative" ref={wrapperRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
                <Slate editor={editor} initialValue={initialValue} onChange={(val) => setValue(val)}>
                    <Editable
                        renderElement={(props) => <Element {...props}/>} renderLeaf={(props) => <Leaf {...props}/>}
                        className="min-h-[52vh] bg-white p-6 leading-relaxed focus:outline-none dark:bg-[#121212] dark:text-gray-100"
                        onKeyDown={onKeyDown}
                    />
                </Slate>
                {/* 斜杠菜单 */}
                {slashOpen && slashRect && (
                    <div
                        className="absolute z-50 w-72 rounded-2xl border bg-white/95 backdrop-blur shadow-lg ring-1 ring-black/5 p-2 border-gray-200 dark:bg-[#1e1e1e]/95 dark:border-[#2d2d30] dark:ring-white/5"
                        style={{left: slashRect.left, top: slashRect.top}}>
                        <div className="px-3 py-2 text-xs text-gray-500">文本格式</div>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                                onClick={() => insertHeading(1)}>标题 1
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                                onClick={() => insertHeading(2)}>标题 2
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                                onClick={() => insertHeading(3)}>标题 3
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                                onClick={() => toggleList('bulleted-list')}>项目符号列表
                        </button>
                        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                                onClick={() => toggleList('numbered-list')}>编号列表
                        </button>
                    </div>
                )}

                {/* 左侧“+”与六点拖柄控件 */}
                {hoverRect && (
                    <div className="absolute -left-10 flex items-center gap-2"
                         style={{top: hoverRect.top + hoverRect.height / 2 - 16}}>
                        <button
                            className="w-7 h-7 rounded-full border bg-white text-gray-700 hover:bg-gray-100 shadow-sm border-gray-200"
                            title="插入菜单" onClick={() => setSlashOpen(true)}>+
                        </button>
                        <div className="relative">
                            <button
                                className="w-7 h-7 rounded-full border bg-white text-gray-700 hover:bg-gray-100 shadow-sm border-gray-200 grid place-items-center text-[10px]"
                                title="块操作" onClick={focusAtHover}>
                                <span className="grid grid-cols-2 gap-0.5 leading-none">
                                  <span>•</span><span>•</span>
                                  <span>•</span><span>•</span>
                                  <span>•</span><span>•</span>
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}