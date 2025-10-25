import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Move } from 'lucide-react';
import { RobotFace } from './RobotFace';
import { chatbotApi } from '../../api/chatbot.api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

export const GlobalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! 👋 I\'m your AI assistant. I can help you navigate the platform, understand yield farming, and answer any questions you have. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 24, y: 100 }); // default: right-6, bottom-24 (100px from bottom)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = chatbotRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setHasDragged(true); // Mark that dragging occurred

        // Calculate position from right and bottom edges
        const currentElement = isOpen ? chatbotRef.current : buttonRef.current;
        const elementWidth = currentElement?.offsetWidth || 80;
        const elementHeight = currentElement?.offsetHeight || 80;

        const newX = window.innerWidth - e.clientX - elementWidth + dragOffset.x;
        const newY = window.innerHeight - e.clientY - elementHeight + dragOffset.y;

        // Constrain to viewport
        const constrainedX = Math.max(10, Math.min(newX, window.innerWidth - elementWidth - 10));
        const constrainedY = Math.max(10, Math.min(newY, window.innerHeight - elementHeight - 10));

        setPosition({ x: constrainedX, y: constrainedY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => setHasDragged(false), 100);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsThinking(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatbotApi.sendMessage(inputMessage, conversationHistory);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error('Chatbot error:', error);

      let toastMessage = 'Failed to get response';
      if (typeof error === 'object' && error !== null) {
        const e = error as { response?: { data?: { message?: string } }; message?: string };
        toastMessage = e.response?.data?.message ?? e.message ?? toastMessage;
      } else if (typeof error === 'string') {
        toastMessage = error;
      }

      toast.error(toastMessage);

      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating robot button */}
      {!isOpen && (
        <div
          ref={buttonRef}
          className={`fixed z-40 group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            right: `${position.x}px`,
            bottom: `${position.y}px`,
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setDragOffset({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
        >
          <button
            onClick={() => {
              // Only toggle chat if not dragging
              if (!hasDragged) {
                toggleChat();
              }
            }}
            className="hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Open chatbot"
          >
            <div className="relative">
              <RobotFace />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-[#10b981] rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
          </button>
        </div>
      )}

      {/* Chat popup */}
      {isOpen && (
        <div
          ref={chatbotRef}
          onMouseDown={handleMouseDown}
          className={`fixed z-40 transition-all duration-300 ${
            isMinimized ? 'w-16' : 'w-96'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Minimized state - just the robot face */}
          {isMinimized ? (
            <button
              onClick={toggleMinimize}
              className="group hover:scale-110 transition-all duration-300 cursor-pointer"
              aria-label="Maximize chatbot"
            >
              <div className="relative">
                <RobotFace isThinking={isThinking} />
                {/* Notification badge if there are new messages */}
                {messages.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {messages.filter((m) => m.role === 'assistant').length}
                  </div>
                )}
                <div className="absolute inset-0 bg-[#10b981] rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
            </button>
          ) : (
            /* Expanded chat window */
            <div className="bg-white dark:bg-[#1a1a1f] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header - Draggable */}
              <div className="bg-gradient-to-r from-[#10b981] to-[#059669] p-4 flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3">
                  <div className="scale-75">
                    <RobotFace isThinking={isThinking} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      AI Assistant
                      <Move size={14} className="text-white/60" />
                    </h3>
                    <p className="text-white/80 text-xs">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMinimize}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                    aria-label="Minimize"
                  >
                    <Minimize2 size={18} />
                  </button>
                  <button
                    onClick={toggleChat}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0d0d12]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-[#10b981] text-white rounded-br-none'
                          : 'bg-white dark:bg-[#1a1a1f] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[10px] opacity-60 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white dark:bg-[#1a1a1f] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-[#1a1a1f] border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isThinking}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-[#0d0d12] border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#10b981] text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isThinking}
                    className="bg-[#10b981] text-white p-2 rounded-full hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
