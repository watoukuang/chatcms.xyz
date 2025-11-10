import React, {useEffect, useMemo, useRef, useState} from 'react';
import Menu, {type DocMeta} from './components/Menu';
import Toolbar from './components/Toolbar';
import {useToast} from 'components/Toast';
import {useConsoleHeaderTitle} from '@/layout/console/Header';

export default function WriterPage(): React.ReactElement {
    const holderRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<any>(null);
    const renderingRef = useRef(false);
    const [ready, setReady] = useState(false);
    const [docs, setDocs] = useState<DocMeta[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const activeDoc = useMemo(() => docs.find(d => d.id === activeId) || null, [docs, activeId]);
    const toast = useToast();
    const {setConfig} = useConsoleHeaderTitle();

    useEffect(() => {
        let destroyed = false;
        const init = async () => {
            const EditorJS = (await import('@editorjs/editorjs')).default;
            const HeaderTool = (await import('@editorjs/header')).default as any;
            const List = (await import('@editorjs/list')).default as any;
            const Checklist = (await import('@editorjs/checklist')).default as any;
            const Quote = (await import('@editorjs/quote')).default as any;
            const Code = (await import('@editorjs/code')).default as any;
            const Table = (await import('@editorjs/table')).default as any;
            const Delimiter = (await import('@editorjs/delimiter')).default as any;
            const Embed = (await import('@editorjs/embed')).default as any;
            const Paragraph = (await import('@editorjs/paragraph')).default as any;

            if (!holderRef.current) return;

            const instance = new EditorJS({
                holder: holderRef.current,
                autofocus: true,
                placeholder: '输入 / 插入块，或直接开始写作',
                inlineToolbar: true,
                tools: {
                    paragraph: {class: Paragraph, inlineToolbar: true} as any,
                    header: {class: HeaderTool, shortcut: 'CMD+ALT+H', inlineToolbar: true} as any,
                    list: {class: List, inlineToolbar: true} as any,
                    checklist: {class: Checklist} as any,
                    quote: {class: Quote, inlineToolbar: true} as any,
                    code: {class: Code} as any,
                    table: {class: Table} as any,
                    delimiter: {class: Delimiter} as any,
                    embed: {class: Embed} as any,
                },
                data: getDocData(activeId),
                onReady: () => {
                    if (destroyed) return;
                    editorRef.current = instance;
                    setReady(true);
                },
            });
        };
        init();
        return () => {
            destroyed = true;
            if (editorRef.current) {
                try {
                    editorRef.current?.destroy();
                } catch {
                }
                editorRef.current = null;
            }
        };
    }, []);

    // 将标题放到 Console Header 中间
    useEffect(() => {
        setConfig({ title: activeDoc?.title ?? '', onChangeTitle: handleChangeTitle });
        return () => setConfig(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeDoc?.title]);

    useEffect(() => {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('writer.docs') : null;
        if (raw) {
            try {
                const list = JSON.parse(raw) as DocMeta[];
                setDocs(list);
                setActiveId(list[0]?.id ?? null);
            } catch {
                bootstrapDocs();
            }
        } else {
            bootstrapDocs();
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('writer.docs', JSON.stringify(docs));
    }, [docs]);

    useEffect(() => {
        const run = async () => {
            if (!ready || !activeId || !editorRef.current) return;
            if (renderingRef.current) return;
            renderingRef.current = true;
            try {
                const data = getDocData(activeId);
                await editorRef.current.render(data);
            } catch (e) {
                console.error('Render error:', e);
            } finally {
                renderingRef.current = false;
            }
        };
        run();
    }, [ready, activeId]);

    const handleSave = async () => {
        const data = await editorRef.current?.save();
        if (!activeId) return;
        persistDocData(activeId, data);
        setDocs(prev => prev.map(d => d.id === activeId ? ({...d, updatedAt: Date.now()}) : d));
        toast.success('内容已保存');
    };

    const handleChangeTitle = (v: string) => {
        if (!activeId) return;
        setDocs(prev => prev.map(d => d.id === activeId ? ({...d, title: v}) : d));
    };

    const handleCreateNote = () => {
        const id = `doc-${Date.now()}`;
        const meta: DocMeta = {id, title: '未命名笔记', updatedAt: Date.now(), type: 'note'};
        setDocs(prev => [meta, ...prev]);
        persistDocData(id, {blocks: [{type: 'paragraph', data: {text: ''}}]});
        setActiveId(id);
    };

    const handleCreateFolder = () => {
        const id = `folder-${Date.now()}`;
        const meta: DocMeta = {id, title: '未命名文件夹', updatedAt: Date.now(), type: 'folder'};
        setDocs(prev => [meta, ...prev]);
        // 文件夹本身不需要编辑器数据，但为了一致性写入一个空块
        persistDocData(id, {blocks: [{type: 'paragraph', data: {text: ''}}]});
        setActiveId(id);
    };

    const handleCreateUnderFolder = (parentId: string, kind: 'folder' | 'note') => {
        const id = `${kind}-${Date.now()}`;
        const title = kind === 'folder' ? '未命名文件夹' : '未命名笔记';
        const meta: DocMeta = {id, title, updatedAt: Date.now(), type: kind, parentId};
        setDocs(prev => [meta, ...prev]);
        // 为一致性仍写入一个空块数据
        persistDocData(id, {blocks: [{type: 'paragraph', data: {text: ''}}]});
        setActiveId(id);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file || !activeId) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                persistDocData(activeId, data);
                if (ready && editorRef.current) {
                    await editorRef.current.render(data);
                }
                toast.success('已导入 JSON');
            } catch {
                toast.error('导入失败：文件格式错误');
            }
        };
        input.click();
    };

    const handleExport = async () => {
        const data = await editorRef.current?.save();
        if (!activeId) return;
        persistDocData(activeId, data);
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeDoc?.title || 'note'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('已导出 JSON');
    };

    const handleInsertImage = () => {
        toast.info('图片工具未安装，暂不支持图片块');
    };

    const handleDelete = (id: string) => {
        setDocs(prev => prev.filter(d => d.id !== id));
        removeDocData(id);
        if (activeId === id) {
            const next = docs.filter(d => d.id !== id)[0]?.id ?? null;
            setActiveId(next);
        }
    };

    function bootstrapDocs() {
        const id = `doc-${Date.now()}`;
        const meta: DocMeta = {id, title: '未命名笔记', updatedAt: Date.now(), type: 'note'};
        setDocs([meta]);
        setActiveId(id);
        persistDocData(id, {blocks: [{type: 'paragraph', data: {text: ''}}]});
    }

    function getDocData(id: string | null) {
        if (!id || typeof window === 'undefined') return {blocks: [{type: 'paragraph', data: {text: ''}}]};
        const raw = localStorage.getItem(`writer.doc:${id}`);
        if (!raw) return {blocks: [{type: 'paragraph', data: {text: ''}}]};
        try {
            return JSON.parse(raw);
        } catch {
            return {blocks: [{type: 'paragraph', data: {text: ''}}]};
        }
    }

    function persistDocData(id: string, data: any) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`writer.doc:${id}`, JSON.stringify(data));
    }

    function removeDocData(id: string) {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(`writer.doc:${id}`);
    }

    return (
        <div className="flex min-h-[80vh]">
            <Menu
                docs={docs}
                activeId={activeId}
                onSelect={setActiveId}
                onCreateFolder={handleCreateFolder}
                onCreateNote={handleCreateNote}
                onCreateUnderFolder={handleCreateUnderFolder}
                onDelete={handleDelete}
            />

            <div className="flex-1 flex flex-col">
                <Toolbar
                    onUndo={() => toast.info('请使用快捷键 Cmd+Z 撤销')}
                    onRedo={() => toast.info('请使用快捷键 Shift+Cmd+Z 重做')}
                    onImport={handleImport}
                    onExport={handleExport}
                    onNew={handleCreateNote}
                    onInsertImage={handleInsertImage}
                />
                <div className="flex-1 px-6 py-5">
                    <div className="max-w-[860px] mx-auto">
                        {/* 标题已移动到 Header 中间 */}
                        <div
                            className="rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#121212]">
                            <div ref={holderRef} className="min-h-[60vh] px-6 py-5"/>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                            支持块：段落、标题、列表、待办、引用、代码、表格、分隔线、嵌入。输入 `/` 呼出块菜单。
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}