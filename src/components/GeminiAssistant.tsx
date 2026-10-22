/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { calculateOpportunityScores, calculateTractionMetrics } from '../lib/calculations';
import { Send, Bot, User, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import Markdown, { type Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Model output is rendered as markdown. Raw HTML is dropped (skipHtml) and only
// these elements are allowed, so nothing from the model is injected as HTML.
const MARKDOWN_ELEMENTS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'blockquote', 'a', 'hr'];

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>,
  h1: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  h2: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  h3: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  h4: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  h5: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  h6: ({ children }) => <p className="font-semibold text-slate-900 mb-1">{children}</p>,
  code: ({ children }) => <code className="bg-slate-100 rounded px-1 text-[0.85em]">{children}</code>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-300 pl-3 text-slate-600">{children}</blockquote>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>
  ),
};

function AssistantMarkdown({ text }: { text: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkBreaks]}
      skipHtml
      allowedElements={MARKDOWN_ELEMENTS}
      unwrapDisallowed
      components={markdownComponents}
    >
      {text}
    </Markdown>
  );
}

export default function DeepSeekAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am the AIM Smart Solutions Pharmaceutical Strategy Assistant. I can use the sample dataset metrics and calculations supplied by this demonstration. \n\nWhat strategic decisions can I help you analyze today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<'ip_limit' | 'global_limit' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested executive questions
  const suggestedQuestions = [
    "Which product has the highest opportunity score and why?",
    "Which locations and pharmacy types show the highest willingness to try a new supplier?",
    "If I reduce our wholesale price, how does it affect our break-even parameters?",
    "Provide a strategic summary of the field survey findings for our executive deck."
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Construct a summary of current app calculations to feed to the assistant's prompt context
  const appStateSummary = useMemo(() => {
    const opportunities = calculateOpportunityScores();
    const traction = calculateTractionMetrics();
    
    const top3 = opportunities.slice(0, 3).map(o => `${o.productName} (Score: ${o.opportunityScore}, Category: ${o.category})`).join(', ');
    const bottom3 = opportunities.slice(-3).map(o => `${o.productName} (Score: ${o.opportunityScore})`).join(', ');

    return `
--- SYSTEM COMPUTED METRICS SUMMARY ---
Total surveyed pharmacies: 20
Top 3 Products by Opportunity Score: ${top3}
Bottom 3 Products by Opportunity Score: ${bottom3}

Early Traction & Pipeline Metrics (Phase 4 Prototype Preview):
- Total Pharmacies Contacted in Field logs: ${traction.contactedCount}
- Overall Field Response Rate: ${traction.responseRate.toFixed(1)}%
- High Interest Rate: ${traction.highInterestRate.toFixed(1)}%
- Quote Request Rate: ${traction.quoteRequestRate.toFixed(1)}%
- Sample Request Rate: ${traction.sampleRequestRate.toFixed(1)}%
- Expressed Switching Pipeline Value: $${traction.pipelineValue.toLocaleString()}
`;
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorMessage(null);
    setLimitNotice(null);
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://xlxyphqzdzhipmllhxaq.supabase.co/functions/v1/pharma-openrouter-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          appStateSummary
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'ip_limit' || errorData.code === 'global_limit') {
          setLimitNotice(errorData.code);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setErrorMessage(error.message || 'Connection lost. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col pb-4 border-b border-slate-100 mb-4">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Executive AI Council</span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Strategy Assistant</h1>
      </div>

      {/* Message History area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-[#1F3864] text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-xl text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <span className="whitespace-pre-line">{msg.content}</span>
                ) : (
                  <AssistantMarkdown text={msg.content} />
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-[#1F3864] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-sm text-slate-400 flex items-center gap-2">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
              <span className="text-xs italic ml-1">Assistant is analysing demo metrics...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2.5 text-xs text-rose-800 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {limitNotice && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 max-w-md mx-auto" role="status">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-px" />
            <span>
              {limitNotice === 'ip_limit'
                ? "You've used today's 3 free questions. Try again tomorrow, or book a call to see the full version."
                : "Today's demo questions are used up. Please try again tomorrow."}{' '}
              <a
                href="https://aimsmartsolutions.tech/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 underline"
              >
                Book a call
              </a>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Pills (only show when not loading & history is short) */}
      {messages.length < 3 && !isLoading && (
        <div className="space-y-1.5 py-4 border-t border-slate-150">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            Suggested Strategic Queries
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 transition-all text-xs text-slate-600 hover:text-blue-600 font-medium px-3 py-1.5 rounded-full text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Send Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex gap-2 pt-2 border-t border-slate-100 bg-slate-50 p-2 rounded-xl border border-slate-200"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a strategic advisory question..."
          disabled={isLoading}
          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
