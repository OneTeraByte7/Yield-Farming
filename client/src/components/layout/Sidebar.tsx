import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Wallet,
  PieChart,
  Settings,
  Sparkles,
  Gift,
  ChevronDown,
  Plus,
  MessageSquare,
  Trash2,
  Loader,
  Pencil,
  Check,
  X,
  Shield,
  Search,
  Brain,
  Bell,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { chatHistoryApi, ChatHistoryItem } from '@/api/chatHistory.api';
import toast from 'react-hot-toast';

interface SubNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  isAML?: boolean;
  subItems?: SubNavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pools', href: '/pools', icon: Layers },
  { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  { name: 'Rewards', href: '/rewards', icon: Gift },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  {
    name: 'Fraud Detector',
    href: '/aml-fraud-detector',
    icon: Shield,
    isAML: true,
    subItems: [
      { name: 'Dashboard', href: '/aml-fraud-detector?screen=dashboard', icon: LayoutDashboard },
      { name: 'Monitor', href: '/aml-fraud-detector?screen=monitor', icon: Search },
      { name: 'Analysis', href: '/aml-fraud-detector?screen=analysis', icon: Brain },
      { name: 'Alerts', href: '/aml-fraud-detector?screen=alerts', icon: Bell },
    ]
  },
  { name: 'AI Strategy Advisor', href: '/strategy-advisor', icon: Sparkles, highlight: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const navigate = useNavigate();
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [showAMLDropdown, setShowAMLDropdown] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const amlDropdownRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatHistory();

    // Refresh chat history every 10 seconds when dropdown is open
    const interval = setInterval(() => {
      if (showAIDropdown) {
        loadChatHistory();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showAIDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAIDropdown(false);
      }
      if (amlDropdownRef.current && !amlDropdownRef.current.contains(event.target as Node)) {
        setShowAMLDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await chatHistoryApi.getUserChats();
      setChatHistory(history);
    } catch (error: unknown) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    // Clear any stored chat ID and navigate to strategy advisor
    localStorage.removeItem('currentChatId');
    navigate('/strategy-advisor?new=true');
    setShowAIDropdown(false);
    handleNavClick();

    // Refresh chat history after a short delay to show new chat
    setTimeout(() => {
      loadChatHistory();
    }, 1000);
  };

  const handleLoadChat = (chatId: string) => {
    // Store the chat ID and navigate
    localStorage.setItem('currentChatId', chatId);
    navigate('/strategy-advisor?chatId=' + chatId);
    setShowAIDropdown(false);
    handleNavClick();
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await chatHistoryApi.deleteChat(chatId);
      await loadChatHistory();
      toast.success('Chat deleted successfully');

      // If deleted chat is the current one, clear it
      if (localStorage.getItem('currentChatId') === chatId) {
        localStorage.removeItem('currentChatId');
      }
    } catch (error: unknown) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleEditClick = (chatId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const handleSaveEdit = async (chatId: string, event?: React.SyntheticEvent) => {
    event?.stopPropagation();

    if (!editingTitle.trim()) {
      toast.error('Chat title cannot be empty');
      return;
    }

    try {
      await chatHistoryApi.updateChatTitle(chatId, editingTitle.trim());
      await loadChatHistory();
      setEditingChatId(null);
      setEditingTitle('');
      toast.success('Chat title updated');
    } catch (error: unknown) {
      console.error('Failed to update chat title:', error);
      toast.error('Failed to update chat title');
    }
  };

  const handleCancelEdit = (event?: React.SyntheticEvent) => {
    event?.stopPropagation();
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col w-64 bg-white/15 dark:bg-[#0d0d12]/95 backdrop-blur-2xl border-r border-primary-500/20 dark:border-primary-700/30 h-[calc(100vh-4rem)] shadow-royal relative",
        "lg:sticky lg:top-16",
        "fixed top-16 left-0 z-50 transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-primary-500/5 dark:from-primary-700/10 dark:via-transparent dark:to-primary-700/10 opacity-60" aria-hidden="true" />
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          // Special handling for AI Strategy Advisor
          if (item.highlight) {
            return (
              <div key={item.name} ref={dropdownRef}>
                <button
                  onClick={() => setShowAIDropdown(!showAIDropdown)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all backdrop-blur-xl relative z-10 group',
                    'text-primary-600 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/50 border border-transparent hover:border-primary-500/30 dark:hover:border-primary-600/30 hover:shadow-md hover:text-primary-700 dark:hover:text-slate-50',
                    'animate-pulse'
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400/25 via-primary-500/20 to-primary-600/25 dark:from-primary-600/30 dark:via-primary-500/25 dark:to-primary-600/30 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center space-x-3 relative z-10">
                    <item.icon className="w-5 h-5 animate-float" />
                    <span className="font-bold">{item.name}</span>
                  </div>

                  <div className="flex items-center space-x-2 relative z-10">
                    <span className="px-2.5 py-1 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-500 dark:to-primary-700 text-white text-xs font-extrabold rounded-full shadow-lg">
                      AI
                    </span>
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', showAIDropdown && 'rotate-180')} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div
                  className={cn(
                    'mt-2 mb-2 bg-white dark:bg-[#1a1a1f] rounded-xl shadow-xl border border-[#e8e8e8] dark:border-[#2a2a2f] overflow-hidden transition-all duration-300 ease-in-out origin-top',
                    showAIDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0'
                  )}
                >
                  {showAIDropdown && (
                    <>
                      {/* Action Buttons */}
                      <div className="flex items-center border-b border-[#e8e8e8] dark:border-[#2a2a2f]">
                        <button
                          onClick={handleNewChat}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#2a2a2f] transition-colors"
                        >
                          <Plus className="w-4 h-4 text-[#0610ac]" />
                          <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">New Chat</span>
                        </button>
                      </div>

                      {/* Chat List */}
                      <div>
                        {isLoadingHistory ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader className="w-5 h-5 text-[#0610ac] animate-spin" />
                          </div>
                        ) : chatHistory.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 px-4">
                            <MessageSquare className="w-8 h-8 text-[#999999] mb-2" />
                            <p className="text-xs text-[#666666] dark:text-gray-400 text-center">
                              No saved chats yet
                            </p>
                          </div>
                        ) : (
                          chatHistory.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => editingChatId !== chat.id && handleLoadChat(chat.id)}
                            className="px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#2a2a2f] transition-colors border-b border-[#e8e8e8] dark:border-[#2a2a2f] cursor-pointer group"
                          >
                            {editingChatId === chat.id ? (
                              <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(chat.id, e);
                                    if (e.key === 'Escape') handleCancelEdit(e);
                                  }}
                                  className="w-full text-sm font-semibold px-2 py-1.5 border border-[#0610ac] rounded bg-white dark:bg-[#2a2a2f] text-[#1a1a1a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0610ac]"
                                />
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={(e) => handleSaveEdit(chat.id, e)}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center space-x-1 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Save</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded flex items-center space-x-1 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">Cancel</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white truncate">
                                    {chat.chat_title}
                                  </p>
                                  <p className="text-xs text-[#999999] mt-1">
                                    {new Date(chat.updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                  <button
                                    onClick={(e) => handleEditClick(chat.id, chat.chat_title, e)}
                                    className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  >
                                    <Pencil className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteChat(chat.id, e)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          }

          // Special handling for AML Fraud Detector
          if (item.isAML) {
            return (
              <div key={item.name} ref={amlDropdownRef}>
                <button
                  onClick={() => setShowAMLDropdown(!showAMLDropdown)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all backdrop-blur-xl relative z-10 group',
                    'text-primary-600 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/50 border border-transparent hover:border-primary-500/30 dark:hover:border-primary-600/30 hover:shadow-md hover:text-primary-700 dark:hover:text-slate-50'
                  )}
                >
                  <div className="flex items-center space-x-3 relative z-10">
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.name}</span>
                  </div>

                  <ChevronDown className={cn('w-4 h-4 transition-transform duration-300 relative z-10', showAMLDropdown && 'rotate-180')} />
                </button>

                {/* AML Dropdown Menu */}
                <div
                  className={cn(
                    'mt-2 mb-2 bg-white dark:bg-[#1a1a1f] rounded-xl shadow-xl border border-[#e8e8e8] dark:border-[#2a2a2f] overflow-hidden transition-all duration-300 ease-in-out origin-top',
                    showAMLDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 h-0'
                  )}
                >
                  {showAMLDropdown && item.subItems && (
                    <>
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => {
                            setShowAMLDropdown(false);
                            handleNavClick();
                          }}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center space-x-3 px-4 py-3 hover:bg-[#f6f8fa] dark:hover:bg-[#2a2a2f] transition-colors border-b border-[#e8e8e8] dark:border-[#2a2a2f] last:border-b-0',
                              isActive
                                ? 'bg-[#f0f0f0] dark:bg-[#2a2a2f] text-[#0610ac] dark:text-primary-400'
                                : 'text-[#1a1a1a] dark:text-white'
                            )
                          }
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{subItem.name}</span>
                        </NavLink>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          }

          // Regular nav items
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all backdrop-blur-xl relative z-10 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/30 via-primary-500/20 to-primary-500/10 dark:from-primary-600/40 dark:via-primary-600/25 dark:to-primary-600/15 text-primary-700 dark:text-slate-50 border border-primary-500/50 dark:border-primary-600/50 shadow-lg shadow-primary-500/20 dark:shadow-primary-600/30'
                    : 'text-primary-600 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/50 border border-transparent hover:border-primary-500/30 dark:hover:border-primary-600/30 hover:shadow-md hover:text-primary-700 dark:hover:text-slate-50'
                )
              }
            >
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      </aside>
    </>
  );
};