'use client';

import { useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { JSONContent } from '@tiptap/core';
import { Sparkles, Loader2, RefreshCw, Copy, Check } from 'lucide-react';

type AiPanelProps = {
  noteContent: JSONContent | null;
  noteTitle: string;
  noteId: string;
};

type Mode = 'summarize' | 'autocomplete' | 'chat' | 'generate';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function extractText(content: JSONContent | null): string {
  if (!content) return '';
  if (content.text) return content.text;
  if (content.content) return content.content.map(extractText).join(' ');
  return '';
}

export default function AiPanel({ noteContent, noteTitle }: AiPanelProps) {
  const [mode, setMode] = useState<Mode>('summarize');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const noteText = extractText(noteContent);

  const callGemini = async (prompt: string): Promise<string> => {
    // Get real Firebase ID token for server verification
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('AI request failed');
    const data = await res.json();
    return data.result as string;
  };

  const handleSummarize = async () => {
    if (!noteText.trim()) { setError('Note is empty.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      setResult(await callGemini(`Summarize the following note clearly and concisely in bullet points. Title: "${noteTitle}"\n\nContent:\n${noteText}`));
    } catch { setError('Failed to summarize. Try again.'); }
    finally { setLoading(false); }
  };

  const handleAutocomplete = async () => {
    if (!noteText.trim()) { setError('Write something first.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      setResult(await callGemini(`Continue the following note naturally. Match the writing style. Only return the continuation, do not repeat existing content. Title: "${noteTitle}"\n\nExisting:\n${noteText}\n\nContinuation:`));
    } catch { setError('Failed to continue. Try again.'); }
    finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setLoading(true); setError('');
    try {
      const context = noteText ? `\n\nNote context (title: "${noteTitle}"):\n${noteText}` : '';
      const history = newHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const reply = await callGemini(`You are a helpful assistant. Answer clearly and directly.${context}\n\nConversation:\n${history}\nAssistant:`);
      setChatHistory(h => [...h, { role: 'assistant', content: reply }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { setError('Failed to respond. Try again.'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) { setError('Enter a prompt.'); return; }
    setLoading(true); setError(''); setResult('');
    try {
      setResult(await callGemini(`Write a detailed, well-structured note on: "${generatePrompt}". Use headings and bullet points. Be thorough and informative.`));
    } catch { setError('Failed to generate. Try again.'); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modes: { id: Mode; label: string; emoji: string }[] = [
    { id: 'summarize', label: 'Summarize', emoji: '📝' },
    { id: 'autocomplete', label: 'Continue', emoji: '✍️' },
    { id: 'chat', label: 'Chat', emoji: '💬' },
    { id: 'generate', label: 'Generate', emoji: '⚡' },
  ];

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 shrink-0">
        <Sparkles size={15} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">AI Assistant</span>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-4 gap-1 p-3 border-b shrink-0">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(''); setError(''); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs transition-all ${
              mode === m.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-3 p-4">

        {/* Summarize */}
        {mode === 'summarize' && (
          <>
            <p className="text-xs text-gray-500">Get a bullet-point summary of your current note.</p>
            <button onClick={handleSummarize} disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-all">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Summarizing…' : 'Summarize Note'}
            </button>
          </>
        )}

        {/* Autocomplete */}
        {mode === 'autocomplete' && (
          <>
            <p className="text-xs text-gray-500">AI will continue writing from where you left off.</p>
            <button onClick={handleAutocomplete} disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-all">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <span>✍️</span>}
              {loading ? 'Writing…' : 'Continue Writing'}
            </button>
          </>
        )}

        {/* Generate */}
        {mode === 'generate' && (
          <>
            <p className="text-xs text-gray-500">Generate a detailed note from a prompt.</p>
            <textarea
              value={generatePrompt}
              onChange={e => setGeneratePrompt(e.target.value)}
              placeholder="e.g. Why USA and Iran are in conflict…"
              className="w-full text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-lg p-3 resize-none outline-none focus:border-gray-400"
              rows={3}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
            />
            <button onClick={handleGenerate} disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-all">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <span>⚡</span>}
              {loading ? 'Generating…' : 'Generate Note'}
            </button>
          </>
        )}

        {/* Chat */}
        {mode === 'chat' && (
          <div className="flex flex-col gap-2" style={{ flex: 1 }}>
            <div style={{ flex: 1, minHeight: '200px' }} className="space-y-3">
              {chatHistory.length === 0 && (
                <p className="text-xs text-gray-400 text-center pt-4">Ask anything about your note or any topic…</p>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`text-sm rounded-xl px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white ml-auto max-w-[90%]'
                    : 'bg-gray-100 text-gray-800 max-w-[90%]'
                }`}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 w-fit">
                  <Loader2 size={12} className="animate-spin text-gray-500" />
                  <span className="text-xs text-gray-500">Thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 pt-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                placeholder="Ask something…"
                className="flex-1 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 bg-white"
              />
              <button onClick={handleChat} disabled={loading || !chatInput.trim()}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 transition-all">
                ↑
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 shrink-0">
            {error}
          </div>
        )}

        {/* Result */}
        {result && mode !== 'chat' && (
          <div className="border border-gray-200 rounded-xl overflow-hidden shrink-0">
            <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Result</span>
              <div className="flex gap-1">
                <button onClick={() => setResult('')}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors" title="Clear">
                  <RefreshCw size={12} />
                </button>
                <button onClick={handleCopy}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div className="p-3 bg-white">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}