"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Sparkles,
  Code,
  Database,
  Loader2,
  CheckCircle2,
  Copy,
  Download,
  Trash2,
  Star,
  Clock,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sql?: string;
  results?: any[];
  timestamp: Date;
  executionTime?: number; // in milliseconds
  bookmarked?: boolean;
}

const SAMPLE_QUERIES = [
  "What is the total spend in the last 90 days?",
  "Show me top 5 vendors by spend",
  "List all invoices from October 2025",
  "What's the average invoice value?",
  "Show invoices grouped by category",
  "How many invoices have been processed?",
];

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const startTime = performance.now();

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fba-tasks-fsdi-api.vercel.app";
      const response = await fetch(`${API_BASE}/api/chat-with-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.explanation || `Found ${data.results?.length || 0} results`,
        sql: data.sql,
        results: data.results,
        timestamp: new Date(),
        executionTime,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please make sure the Vanna AI service is running on port 8000.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const exportChatToCSV = () => {
    const csvRows = [
      ["Timestamp", "Type", "Content", "SQL", "Results Count", "Execution Time (ms)"],
    ];

    messages.forEach((msg) => {
      csvRows.push([
        msg.timestamp.toISOString(),
        msg.type,
        `"${msg.content.replace(/"/g, '""')}"`,
        msg.sql ? `"${msg.sql.replace(/"/g, '""')}"` : "",
        msg.results ? msg.results.length.toString() : "0",
        msg.executionTime ? msg.executionTime.toString() : "",
      ]);
    });

    const csv = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    if (confirm("Are you sure you want to clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("chat-history");
    }
  };

  const toggleBookmark = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg))
    );
  };

  const handleSampleQuery = (query: string) => {
    setInput(query);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number") {
      return value.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) {
      return new Date(value).toLocaleDateString("de-DE");
    }
    return String(value);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-7 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chat with Data</h1>
              <p className="text-xs text-gray-500">
                Ask questions in natural language, powered by Vanna AI + Groq
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportChatToCSV} className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChatHistory}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                <Database className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a conversation</h2>
              <p className="text-gray-600">
                Ask questions about your invoice data in natural language
              </p>
            </div>

            {/* Bookmarked Queries */}
            {messages.some((m) => m.bookmarked) && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Bookmarked Queries
                  </CardTitle>
                  <CardDescription>Quickly re-run your favorite queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {messages
                      .filter((m) => m.bookmarked && m.type === "user")
                      .slice(-5)
                      .map((msg) => (
                        <button
                          key={msg.id}
                          onClick={() => handleSampleQuery(msg.content)}
                          className="w-full text-left p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <Star className="w-3 h-3 text-yellow-600 mt-1 flex-shrink-0 fill-yellow-600" />
                            <span className="text-sm text-gray-700">{msg.content}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Try these sample queries:</CardTitle>
                <CardDescription>Click any question to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SAMPLE_QUERIES.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuery(query)}
                      className="text-left p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{query}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Ask your question in natural language</li>
                    <li>Vanna AI converts it to SQL using Groq LLM</li>
                    <li>Query executes on your PostgreSQL database</li>
                    <li>Results are displayed in an easy-to-read format</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl ${
                    message.type === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-50 border border-gray-200"
                  } rounded-2xl shadow-sm px-5 py-3`}
                >
                  {/* Message Content */}
                  <div className="mb-2">
                    <p
                      className={`text-sm ${
                        message.type === "user" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>

                  {/* SQL Query */}
                  {message.sql && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">Generated SQL:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {message.executionTime && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {message.executionTime}ms
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.sql!, `sql-${message.id}`)}
                            className="h-6 px-2"
                          >
                            {copiedId === `sql-${message.id}` ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(message.id)}
                            className="h-6 px-2"
                          >
                            <Star
                              className={`w-3 h-3 ${
                                message.bookmarked ? "fill-yellow-400 text-yellow-400" : ""
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                        <code className="text-xs text-green-400 font-mono">{message.sql}</code>
                      </div>
                    </div>
                  )}

                  {/* Results Table */}
                  {message.results && message.results.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">
                            Results ({message.results.length} rows):
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const csv = [
                              Object.keys(message.results![0]).join(","),
                              ...message.results!.map((row) =>
                                Object.values(row)
                                  .map((v) => `"${v}"`)
                                  .join(",")
                              ),
                            ].join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `query-results-${message.id}.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                      <div className="overflow-x-auto rounded-md border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(message.results[0]).map((key) => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {message.results.map((row, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                {Object.values(row).map((value: any, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="px-4 py-2 text-gray-900 whitespace-nowrap"
                                  >
                                    {formatValue(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {message.results && message.results.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">No results found</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="mt-2 text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString("de-DE")}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">
                      Generating SQL and fetching results...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-8 py-3 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="What is the total spend in the last 90 day"
              className="flex-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-lg h-11"
              disabled={loading}
              autoComplete="off"
            />
            <Button
              type="submit"
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="bg-purple-600 hover:bg-purple-700 rounded-lg px-5 h-11"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by Vanna AI with Groq LLM • Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
