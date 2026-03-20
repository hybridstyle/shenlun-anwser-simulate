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
  const [gridWidth, setGridWidth] = useState(25);
  const [cellSize, setCellSize] = useState(40);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive cell size calculation
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Account for padding (sm:p-8 = 64px, p-4 = 32px)
        const padding = window.innerWidth >= 640 ? 64 : 32;
        const availableWidth = containerWidth - padding;
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
            <div className="bg-red-600 p-2 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">申论田字格模拟器</h1>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Shenlun Grid Simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-stone-400 font-semibold uppercase">当前字数</p>
              <p className="text-lg font-mono font-bold text-red-600 leading-none">{wordCount}</p>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <motion.main 
        layout
        className="max-w-5xl mx-auto p-6 flex flex-col lg:flex-row gap-8 items-start overflow-hidden"
      >
        {/* Input Section */}
        <AnimatePresence initial={false}>
          {!isInputCollapsed && (
            <motion.section 
              layout
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ 
                opacity: 1, 
                width: 'auto',
                marginRight: 32, // gap-8 = 32px
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
                  className="flex-1 p-4 resize-none focus:outline-none text-lg leading-relaxed text-stone-800 placeholder:text-stone-300"
                  placeholder="请在此粘贴或输入您的申论文字..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3"
                  >
                    <h3 className="text-sm font-bold text-stone-700">设置</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-stone-500">每行格数</label>
                      <div className="flex items-center gap-2">
                        {[15, 20, 25].map((w) => (
                          <button
                            key={w}
                            onClick={() => setGridWidth(w)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                              gridWidth === w 
                              ? 'bg-red-600 text-white' 
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Preview Section */}
        <motion.section 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 w-full relative" 
          ref={containerRef}
        >
            {isInputCollapsed && (
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
            <div className="bg-white rounded-2xl shadow-md border border-stone-200 p-4 sm:p-8 overflow-hidden min-h-[600px] flex justify-center items-start">
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
                      stroke="#f87171" strokeWidth="1" strokeOpacity="0.5" 
                    />
                  ))}
                  {/* Horizontal Solid Lines */}
                  {Array.from({ length: Math.max(15, Math.ceil(characters.length / gridWidth)) + 1 }).map((_, i) => (
                    <line 
                      key={`h-solid-${i}`}
                      x1="0" y1={i * cellSize + 0.5} 
                      x2="100%" y2={i * cellSize + 0.5} 
                      stroke="#f87171" strokeWidth="1" strokeOpacity="0.5" 
                    />
                  ))}

                  {/* Vertical Dashed Lines */}
                  {Array.from({ length: gridWidth }).map((_, i) => (
                    <line 
                      key={`v-dashed-${i}`}
                      x1={i * cellSize + (cellSize / 2) + 0.5} y1="0" 
                      x2={i * cellSize + (cellSize / 2) + 0.5} y2="100%" 
                      stroke="#f87171" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2,2"
                    />
                  ))}
                  {/* Horizontal Dashed Lines */}
                  {Array.from({ length: Math.max(15, Math.ceil(characters.length / gridWidth)) }).map((_, i) => (
                    <line 
                      key={`h-dashed-${i}`}
                      x1="0" y1={i * cellSize + (cellSize / 2) + 0.5} 
                      x2="100%" y2={i * cellSize + (cellSize / 2) + 0.5} 
                      stroke="#f87171" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2,2"
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
                      className="font-serif"
                      style={{ 
                        fontSize: `${Math.floor(cellSize * 0.6)}px`, 
                        fill: '#1c1917',
                        fontFamily: '"Noto Serif SC", serif'
                      }}
                    >
                      {char}
                    </motion.text>
                  ))}
                </svg>

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
                        className="absolute -right-16 w-16 flex items-center pl-2 text-[10px] font-mono font-bold text-red-400 whitespace-nowrap"
                        style={{ top: row * cellSize, height: cellSize }}
                      >
                        ← {count} 字
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
        </motion.section>
      </motion.main>

      {/* SEO Content Section */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
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
        <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <FileText size={18} />
          <span className="font-bold">{wordCount}</span>
        </div>
      </div>
    </div>
  );
}
