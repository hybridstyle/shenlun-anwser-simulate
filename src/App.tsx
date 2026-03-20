/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Trash2, Type, FileText, Settings2, ChevronLeft, ChevronRight } from 'lucide-react';

const GRID_WIDTH = 25; // Standard Shenlun grid width per row

export default function App() {
  const [text, setText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [gridWidth, setGridWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shenlun_grid_width');
      return saved ? JSON.parse(saved) : 25;
    }
    return 25;
  });
  const [cellSize, setCellSize] = useState(40);
  const [isInputCollapsed, setIsInputCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shenlun_input_collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isDesktop, setIsDesktop] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const isComposing = useRef(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOfficeMode, setIsOfficeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shenlun_office_mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist office mode state
  useEffect(() => {
    localStorage.setItem('shenlun_office_mode', JSON.stringify(isOfficeMode));
    
    // Update document title for stealth
    if (isOfficeMode) {
      document.title = '新建文档 - Word';
    } else {
      document.title = '申论田字格模拟器 - 公务员考试申论写作练习工具';
    }
  }, [isOfficeMode]);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('shenlun_input_collapsed', JSON.stringify(isInputCollapsed));
  }, [isInputCollapsed]);

  // Persist grid width state
  useEffect(() => {
    localStorage.setItem('shenlun_grid_width', JSON.stringify(gridWidth));
  }, [gridWidth]);

  // Responsive cell size calculation
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const desktop = window.innerWidth >= 1024;
        setIsDesktop(desktop);
        if (!desktop) {
          setEditingIndex(null);
        }
        // Account for padding (sm:p-8 = 64px, p-4 = 32px)
        const padding = window.innerWidth >= 640 ? 64 : 32;
        const availableWidth = containerWidth - padding - 2; // Added 2px buffer
        const optimalSize = Math.floor(availableWidth / gridWidth);
        // Max size 40px, but can be smaller
        setCellSize(Math.min(40, optimalSize));
      }
    };

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    updateSize();

    return () => observer.disconnect();
  }, [gridWidth]);

  // Process text into characters, including punctuation
  const characters = useMemo(() => {
    // We treat every character (including spaces and punctuation) as one cell
    // In real Shenlun, spaces might be ignored or used for indentation.
    // Let's keep it simple: every char is a cell.
    return text.split('');
  }, [text]);

  const wordCount = characters.length;

  const handleClear = () => {
    setText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCellClick = (idx: number) => {
    setEditingIndex(idx);
    setEditValue(characters[idx] || '');
  };

  const handleCellEdit = (val: string) => {
    setEditValue(val);
    
    // Only commit if NOT composing and we have content
    if (!isComposing.current && val.length > 0) {
      const chars = val.split('');
      const newChars = [...characters];
      
      // Ensure we have enough length to reach the editing index
      while (newChars.length < editingIndex!) {
        newChars.push(' ');
      }
      
      // Replace the character at current index and insert any additional ones
      // This behaves like "overtype" for the first char and "insert" for the rest
      newChars.splice(editingIndex!, 1, ...chars);
      setText(newChars.join(''));
      
      // Move cursor forward by the number of characters inserted
      setEditingIndex(editingIndex! + chars.length);
      setEditValue('');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-red-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4">
        {/* Visually hidden SEO text */}
        <div className="sr-only">
          <h2>申论写作练习工具 - 模拟田字格排版</h2>
          <p>本工具专为公务员考试申论写作设计，提供标准的 15x15、20x20、25x25 田字格模拟。支持自动字数统计，严格遵循标点符号占格规则，帮助考生精准掌控写作篇幅。</p>
        </div>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white transition-colors ${isOfficeMode ? 'bg-stone-400' : 'bg-red-600'}`}>
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isOfficeMode ? '在线文本编辑器' : '申论田字格模拟器'}
              </h1>
              {!isOfficeMode && (
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Shenlun Grid Simulator</p>
              )}
              {isOfficeMode && (
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Draft Notes v2.4</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-stone-400 font-semibold uppercase">
                {isOfficeMode ? '字符数' : '当前字数'}
              </p>
              <p className={`text-lg font-mono font-bold leading-none transition-colors ${isOfficeMode ? 'text-stone-600' : 'text-red-600'}`}>
                {wordCount}
              </p>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
            >
              <Settings2 size={20} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className={`p-2 rounded-full transition-all ${
                  showClearConfirm 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'hover:bg-red-50 text-stone-600 hover:text-red-600'
                }`}
                title="一键清空"
              >
                <Trash2 size={20} />
              </button>
              
              <AnimatePresence>
                {showClearConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute right-0 top-full mt-2 bg-white border border-stone-200 shadow-xl rounded-xl p-3 z-50 min-w-[160px]"
                  >
                    <p className="text-xs font-bold text-stone-700 mb-3">确定清空所有内容吗？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleClear();
                          setShowClearConfirm(false);
                        }}
                        className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded-md font-bold hover:bg-red-700 transition-colors"
                      >
                        确认清空
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 bg-stone-100 text-stone-600 text-xs py-1.5 rounded-md font-bold hover:bg-stone-200 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button 
                onClick={handleCopy}
                className={`p-2 rounded-full transition-all ${
                  isCopied
                  ? (isOfficeMode ? 'bg-stone-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md')
                  : (isOfficeMode ? 'hover:bg-stone-100 text-stone-600' : 'hover:bg-red-50 text-stone-600 hover:text-red-600')
                }`}
                title="复制全部文字"
              >
                <Copy size={20} />
              </button>
              
              <AnimatePresence>
                {isCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute right-0 top-full mt-2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap"
                  >
                    已复制到剪贴板
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <motion.main 
        layout
        className="max-w-[1600px] mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start"
      >
        {/* Input Section */}
        <AnimatePresence initial={false}>
          {(!isInputCollapsed || !isDesktop) && (
            <motion.section 
              layout
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ 
                opacity: 1, 
                width: isDesktop ? 'auto' : '100%',
                marginRight: isDesktop ? 32 : 0, // gap-8 = 32px
                transition: {
                  width: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2, delay: 0.1 }
                }
              }}
              exit={{ 
                opacity: 0, 
                width: 0, 
                marginRight: 0,
                transition: {
                  width: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.1 }
                }
              }}
              className="w-full lg:w-[41.666667%] shrink-0 space-y-4" // lg:col-span-5 is approx 41.6%
            >
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[500px]">
                <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-600 font-medium text-sm">
                    <Type size={16} />
                    <span>输入文字</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleCopy}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-stone-500 hover:text-stone-700"
                      title="复制"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={handleClear}
                      className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-stone-500 hover:text-red-600"
                      title="清空"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => setIsInputCollapsed(true)}
                      className="hidden lg:flex p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-stone-500 hover:text-stone-700"
                      title="收起输入框"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
                <textarea
                  className={`flex-1 p-4 resize-none focus:outline-none text-lg leading-relaxed text-stone-800 placeholder:text-stone-300 ${isOfficeMode ? 'font-sans' : 'font-serif'}`}
                  placeholder={isOfficeMode ? "在此输入您的笔记内容..." : "请在此粘贴或输入您的申论文字..."}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Preview Section */}
        <motion.section 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 min-w-0 w-full relative space-y-4" 
          ref={containerRef}
        >
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <h3 className="text-sm font-bold text-stone-700">设置</h3>
                      <div className="hidden sm:block h-4 w-px bg-stone-200" />
                      <div className="flex items-center gap-4">
                        <label className="text-sm text-stone-500">每行格数</label>
                        <div className="flex items-center gap-2">
                          {[15, 20, 25].map((w) => (
                            <button
                              key={w}
                              onClick={() => setGridWidth(w)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                gridWidth === w 
                                ? (isOfficeMode ? 'bg-stone-600 text-white' : 'bg-red-600 text-white')
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="hidden sm:block h-4 w-px bg-stone-200" />
                      <div className="flex items-center gap-4">
                        <label className="text-sm text-stone-500">办公室模式</label>
                        <button
                          onClick={() => setIsOfficeMode(!isOfficeMode)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isOfficeMode ? 'bg-stone-600' : 'bg-stone-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isOfficeMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      关闭
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isInputCollapsed && isDesktop && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsInputCollapsed(false)}
                className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white border border-stone-200 shadow-md p-1 rounded-full text-stone-400 hover:text-red-600 transition-colors"
                title="展开输入框"
              >
                <ChevronRight size={20} />
              </motion.button>
            )}
            <div className="bg-white rounded-2xl shadow-md border border-stone-200 p-4 sm:p-8 overflow-x-auto min-h-[600px] flex justify-start lg:justify-center items-start">
              <div 
                className="relative bg-white"
                style={{ 
                  width: `${gridWidth * cellSize + 1}px`,
                  height: `${Math.max(15, Math.ceil(characters.length / gridWidth)) * cellSize + 1}px`
                }}
              >
                <svg 
                  width={gridWidth * cellSize + 1} 
                  height={Math.max(15, Math.ceil(characters.length / gridWidth)) * cellSize + 1} 
                  xmlns="http://www.w3.org/2000/svg" 
                  shapeRendering="crispEdges"
                  className="absolute inset-0"
                >
                  {/* Vertical Solid Lines */}
                  {Array.from({ length: gridWidth + 1 }).map((_, i) => (
                    <line 
                      key={`v-solid-${i}`}
                      x1={i * cellSize + 0.5} y1="0" 
                      x2={i * cellSize + 0.5} y2="100%" 
                      stroke={isOfficeMode ? "#d1d5db" : "#f87171"} 
                      strokeWidth="1" 
                      strokeOpacity={isOfficeMode ? "0.3" : "0.5"} 
                    />
                  ))}
                  {/* Horizontal Solid Lines */}
                  {Array.from({ length: Math.max(15, Math.ceil(characters.length / gridWidth)) + 1 }).map((_, i) => (
                    <line 
                      key={`h-solid-${i}`}
                      x1="0" y1={i * cellSize + 0.5} 
                      x2="100%" y2={i * cellSize + 0.5} 
                      stroke={isOfficeMode ? "#d1d5db" : "#f87171"} 
                      strokeWidth="1" 
                      strokeOpacity={isOfficeMode ? "0.3" : "0.5"} 
                    />
                  ))}

                  {/* Vertical Dashed Lines */}
                  {Array.from({ length: gridWidth }).map((_, i) => (
                    <line 
                      key={`v-dashed-${i}`}
                      x1={i * cellSize + (cellSize / 2) + 0.5} y1="0" 
                      x2={i * cellSize + (cellSize / 2) + 0.5} y2="100%" 
                      stroke={isOfficeMode ? "#d1d5db" : "#f87171"} 
                      strokeWidth="1" 
                      strokeOpacity={isOfficeMode ? "0.1" : "0.2"} 
                      strokeDasharray="2,2"
                    />
                  ))}
                  {/* Horizontal Dashed Lines */}
                  {Array.from({ length: Math.max(15, Math.ceil(characters.length / gridWidth)) }).map((_, i) => (
                    <line 
                      key={`h-dashed-${i}`}
                      x1="0" y1={i * cellSize + (cellSize / 2) + 0.5} 
                      x2="100%" y2={i * cellSize + (cellSize / 2) + 0.5} 
                      stroke={isOfficeMode ? "#d1d5db" : "#f87171"} 
                      strokeWidth="1" 
                      strokeOpacity={isOfficeMode ? "0.1" : "0.2"} 
                      strokeDasharray="2,2"
                    />
                  ))}

                  {/* Characters - Rendered inside SVG for absolute alignment */}
                  {characters.map((char, idx) => (
                    <motion.text 
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.001, 0.5) }}
                      x={(idx % gridWidth) * cellSize + (cellSize / 2) + 0.5}
                      y={Math.floor(idx / gridWidth) * cellSize + (cellSize / 2) + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`${isOfficeMode ? 'font-sans' : 'font-serif'} pointer-events-none`}
                      style={{ 
                        fontSize: `${Math.floor(cellSize * 0.6)}px`, 
                        fill: isOfficeMode ? '#4b5563' : '#1c1917',
                        fontFamily: isOfficeMode ? 'system-ui, sans-serif' : '"Noto Serif SC", serif'
                      }}
                    >
                      {char}
                    </motion.text>
                  ))}

                  {/* Composition Preview */}
                  {editingIndex !== null && editValue.length > 0 && (
                    editValue.split('').map((char, i) => {
                      const idx = editingIndex + i;
                      return (
                        <text
                          key={`comp-${idx}`}
                          x={(idx % gridWidth) * cellSize + (cellSize / 2) + 0.5}
                          y={Math.floor(idx / gridWidth) * cellSize + (cellSize / 2) + 0.5}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className={`${isOfficeMode ? 'font-sans' : 'font-serif'} pointer-events-none`}
                          style={{ 
                            fontSize: `${Math.floor(cellSize * 0.6)}px`, 
                            fill: '#3b82f6', // Blue for composition
                            fontFamily: isOfficeMode ? 'system-ui, sans-serif' : '"Noto Serif SC", serif',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                          }}
                        >
                          {char}
                        </text>
                      );
                    })
                  )}

                  {/* Clickable areas for editing - Only on Desktop */}
                  {isDesktop && Array.from({ length: Math.max(gridWidth * 15, characters.length + 1) }).map((_, idx) => (
                    <rect
                      key={`click-${idx}`}
                      x={(idx % gridWidth) * cellSize}
                      y={Math.floor(idx / gridWidth) * cellSize}
                      width={cellSize}
                      height={cellSize}
                      fill="transparent"
                      className="cursor-text hover:fill-red-50/40 transition-colors"
                      onClick={() => handleCellClick(idx)}
                    />
                  ))}
                </svg>

                {/* Inline Editor Overlay */}
                {editingIndex !== null && (
                  <input
                    autoFocus
                    className={`absolute z-30 bg-transparent border-2 ${isOfficeMode ? 'border-stone-400' : 'border-red-500'} text-center ${isOfficeMode ? 'font-sans' : 'font-serif'} focus:outline-none shadow-lg`}
                    style={{
                      left: (editingIndex % gridWidth) * cellSize,
                      top: Math.floor(editingIndex / gridWidth) * cellSize,
                      width: cellSize + 1,
                      height: cellSize + 1,
                      fontSize: `${Math.floor(cellSize * 0.6)}px`,
                      fontFamily: isOfficeMode ? 'system-ui, sans-serif' : '"Noto Serif SC", serif',
                      color: 'transparent',
                      caretColor: isOfficeMode ? '#4b5563' : '#ef4444'
                    }}
                    value={editValue}
                    onCompositionStart={() => { isComposing.current = true; }}
                    onCompositionEnd={(e) => {
                      isComposing.current = false;
                      // Trigger edit with the final composed value
                      handleCellEdit(e.currentTarget.value);
                    }}
                    onChange={(e) => handleCellEdit(e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && editValue === '') {
                        const prevIdx = editingIndex! - 1;
                        if (prevIdx >= 0) {
                          const newChars = [...characters];
                          newChars.splice(prevIdx, 1);
                          setText(newChars.join(''));
                          setEditingIndex(prevIdx);
                        }
                        e.preventDefault();
                      } else if (e.key === 'Delete' && editValue === '') {
                        if (editingIndex! < characters.length) {
                          const newChars = [...characters];
                          newChars.splice(editingIndex!, 1);
                          setText(newChars.join(''));
                        }
                        e.preventDefault();
                      } else if (e.key === 'ArrowLeft') {
                        setEditingIndex(Math.max(0, editingIndex! - 1));
                        e.preventDefault();
                      } else if (e.key === 'ArrowRight') {
                        setEditingIndex(Math.min(characters.length, editingIndex! + 1));
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp') {
                        setEditingIndex(Math.max(0, editingIndex! - gridWidth));
                        e.preventDefault();
                      } else if (e.key === 'ArrowDown') {
                        setEditingIndex(Math.min(characters.length, editingIndex! + gridWidth));
                        e.preventDefault();
                      } else if (e.key === 'Enter' || e.key === 'Escape') {
                        setEditingIndex(null);
                      }
                    }}
                  />
                )}

                {/* Overlay for Row Numbers and Word Count */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Row Numbers */}
                  {Array.from({ length: Math.max(15, Math.ceil(characters.length / gridWidth)) }).map((_, i) => (
                    <div 
                      key={`row-num-${i}`}
                      className="absolute -left-8 w-8 flex items-center justify-end pr-2 text-[10px] font-mono text-stone-400"
                      style={{ top: i * cellSize, height: cellSize }}
                    >
                      {i + 1}
                    </div>
                  ))}
                  
                  {/* Word Count Markers (only show up to current text length) */}
                  {Array.from({ length: Math.floor(characters.length / 100) }).map((_, i) => {
                    const count = (i + 1) * 100;
                    const idx = count - 1;
                    const row = Math.floor(idx / gridWidth);
                    return (
                      <div 
                        key={`count-${count}`}
                        className={`absolute -right-16 w-16 flex items-center pl-2 text-[10px] font-mono font-bold whitespace-nowrap transition-colors ${isOfficeMode ? 'text-stone-300' : 'text-red-400'}`}
                        style={{ top: row * cellSize, height: cellSize }}
                      >
                        ← {count} {isOfficeMode ? '' : '字'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </motion.section>
      </motion.main>

      {/* SEO Content Section */}
      <section className={`max-w-5xl mx-auto px-6 pb-12 ${isOfficeMode ? 'sr-only' : ''}`}>
        <div className="bg-white/50 rounded-2xl p-8 border border-stone-200/60">
          <h2 className="text-lg font-bold text-stone-700 mb-4">关于申论田字格模拟器</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-stone-500 leading-relaxed">
            <div>
              <h3 className="font-bold text-stone-600 mb-2">标准排版</h3>
              <p>提供 15、20、25 字每行的标准申论田字格，完美模拟真实考场答题纸效果。</p>
            </div>
            <div>
              <h3 className="font-bold text-stone-600 mb-2">字数统计</h3>
              <p>实时统计输入字数，支持标点符号占格计算，帮助您精准控制申论大作文篇幅。</p>
            </div>
            <div>
              <h3 className="font-bold text-stone-600 mb-2">备考利器</h3>
              <p>适用于国考、省考等各类公务员考试申论写作练习，提升排版美观度与字数掌控力。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Stats for mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <div className={`text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors ${isOfficeMode ? 'bg-stone-600' : 'bg-red-600'}`}>
          <FileText size={18} />
          <span className="font-bold">{wordCount}</span>
        </div>
      </div>
    </div>
  );
}
