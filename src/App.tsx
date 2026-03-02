import React, { useState } from 'react';
import { Database, Terminal, Send, Loader2, Copy, CheckCircle2, Table2, AlertCircle } from 'lucide-react';
import { generateSQL } from './services/gemini';

export default function App() {
  const [question, setQuestion] = useState('');
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setSql('');
    setCopied(false);

    try {
      const result = await generateSQL(question);
      const cleanSql = result.replace(/```sql\n?/gi, '').replace(/```\n?/g, '').trim();
      setSql(cleanSql);
    } catch (err) {
      setError('Failed to generate SQL. Please check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {/* Sidebar - Schema */}
      <div className="w-full md:w-80 border-r border-zinc-800/60 bg-[#111111] p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <div className="flex items-center gap-2 text-zinc-100 mb-6">
            <Database className="w-5 h-5 text-indigo-400" />
            <h1 className="font-semibold tracking-tight">Schema Context</h1>
          </div>
          
          <div className="space-y-6">
            {/* Users Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-800/30 px-4 py-2 flex items-center gap-2 border-b border-zinc-800/50">
                <Table2 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Users</span>
              </div>
              <div className="p-4 flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between"><span className="text-indigo-300">id</span><span className="text-zinc-500">INT (PK)</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">username</span><span className="text-zinc-500">VARCHAR</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">join_date</span><span className="text-zinc-500">DATE</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">subscription_tier</span><span className="text-zinc-500">ENUM</span></div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="bg-zinc-800/30 px-4 py-2 flex items-center gap-2 border-b border-zinc-800/50">
                <Table2 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">Orders</span>
              </div>
              <div className="p-4 flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between"><span className="text-indigo-300">order_id</span><span className="text-zinc-500">INT (PK)</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">user_id</span><span className="text-zinc-500">INT (FK)</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">product_name</span><span className="text-zinc-500">VARCHAR</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">amount</span><span className="text-zinc-500">DECIMAL</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">status</span><span className="text-zinc-500">ENUM</span></div>
                <div className="flex justify-between"><span className="text-indigo-300">created_at</span><span className="text-zinc-500">TIMESTAMP</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen max-h-screen">
        {/* Output Area */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col">
          <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center">
            {!sql && !loading && !error && (
              <div className="text-center space-y-4 opacity-60">
                <Terminal className="w-12 h-12 mx-auto text-zinc-600" />
                <p className="text-lg">Ask a business question to generate SQL.</p>
                <p className="text-sm text-zinc-500">Example: "Show me the top 5 enterprise users by total order amount."</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center space-y-4 opacity-60">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm animate-pulse">Translating to SQL...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {sql && !loading && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Generated SQL</h2>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-800/50 hover:bg-zinc-800 px-2.5 py-1.5 rounded-md"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-[#050505] border border-zinc-800/80 rounded-xl p-6 shadow-2xl overflow-x-auto">
                  <pre className="font-mono text-sm leading-relaxed text-indigo-300">
                    <code>{sql}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 md:p-10 pt-0">
          <div className="max-w-3xl w-full mx-auto">
            <form onSubmit={handleGenerate} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative bg-[#111111] border border-zinc-800 rounded-2xl flex items-end overflow-hidden focus-within:border-indigo-500/50 transition-colors">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the total revenue from Pro users this month?"
                  className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 p-4 min-h-[60px] max-h-[200px] resize-y focus:outline-none text-base"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate(e);
                    }
                  }}
                />
                <div className="p-3 shrink-0">
                  <button
                    type="submit"
                    disabled={!question.trim() || loading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2.5 rounded-xl transition-all flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-zinc-600">Press <kbd className="font-sans px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Enter</kbd> to generate, <kbd className="font-sans px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Shift + Enter</kbd> for new line</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
