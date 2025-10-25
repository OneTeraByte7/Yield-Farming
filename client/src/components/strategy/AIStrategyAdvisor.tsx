import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, DollarSign, Target, Loader } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ChatMessage, UserInvestmentProfile, InvestmentStrategy } from '@/types/strategy';
import { StrategyService } from '@/services/strategyService';
import { StrategyCard } from './StrategyCard';
import { StrategyExecutionModal } from './StrategyExecutionModal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { usePools } from '@/hooks/usePools';
import { cn } from '@/utils/cn';
import { aiApi } from '@/api/ai.api';
import { chatHistoryApi } from '@/api/chatHistory.api';
import toast from 'react-hot-toast';

export const AIStrategyAdvisor: React.FC = () => {
  const { pools } = usePools();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Strategy Advisor. I'll help you create personalized yield farming strategies based on your goals. Let's start by understanding your investment profile.",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'investment' | 'returns' | 'days' | 'apy' | 'complete'>('investment');
  const [profile, setProfile] = useState<Partial<UserInvestmentProfile>>({});
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<InvestmentStrategy | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat history state
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);

  // Custom input mode
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputData, setCustomInputData] = useState({
    investmentAmount: '',
    expectedReturns: '',
    investmentDays: '',
    targetApy: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle URL parameters for loading specific chat and restore from localStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chatId');
    const isNew = params.get('new');

    if (isNew === 'true') {
      // Start new chat
      startNewChat();
    } else if (chatId) {
      // Load specific chat from URL
      loadChat(chatId);
    } else {
      // Try to restore from localStorage
      const savedChatId = localStorage.getItem('currentChatId');
      if (savedChatId) {
        console.log('Restoring chat from localStorage:', savedChatId);
        loadChat(savedChatId);
      }
    }
  }, [location.search]);

  // Save current chat state to localStorage on changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
      console.log('Saved currentChatId to localStorage:', currentChatId);
    }
  }, [currentChatId]);

  // Auto-save chat when messages change
  useEffect(() => {
    if (messages.length > 1) {
      // Debounce save to avoid too many requests
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, profile, strategies]);

  const saveCurrentChat = async () => {
    try {
      console.log('Auto-saving chat...', {
        messageCount: messages.length,
        hasProfile: !!profile,
        hasStrategies: strategies.length > 0,
        currentChatId
      });

      const savedChat = await chatHistoryApi.saveChat({
        messages,
        investmentProfile: profile,
        strategies,
        chatId: currentChatId,
      });

      console.log('Chat saved successfully:', savedChat.id);

      // Update current chat ID if this was a new chat
      if (!currentChatId) {
        setCurrentChatId(savedChat.id);
        console.log('New chat created with ID:', savedChat.id);
      }
    } catch (error: any) {
      console.error('Failed to save chat:', error);
      // Show error for debugging
      if (error.response?.status === 401) {
        console.error('Authentication error - user may not be logged in');
      }
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      console.log('Loading chat:', chatId);
      const chat = await chatHistoryApi.getChatById(chatId);
      if (chat) {
        console.log('Chat loaded:', chat);
        // Convert timestamp strings back to Date objects
        const loadedMessages = chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        setMessages(loadedMessages);
        setProfile(chat.investment_profile || {});
        setStrategies(chat.strategies || []);
        setCurrentChatId(chat.id);

        // Determine current step from profile
        if (chat.strategies && chat.strategies.length > 0) {
          setCurrentStep('complete');
        } else if (chat.investment_profile?.targetApy) {
          setCurrentStep('complete');
        } else if (chat.investment_profile?.investmentDays) {
          setCurrentStep('apy');
        } else if (chat.investment_profile?.expectedReturns) {
          setCurrentStep('days');
        } else if (chat.investment_profile?.investmentAmount) {
          setCurrentStep('returns');
        } else {
          setCurrentStep('investment');
        }
      }
    } catch (error: any) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI Strategy Advisor. I'll help you create personalized yield farming strategies based on your goals. Let's start by understanding your investment profile.",
        timestamp: new Date(),
      }
    ]);
    setProfile({});
    setStrategies([]);
    setCurrentStep('investment');
    setCurrentChatId(undefined);
    localStorage.removeItem('currentChatId');
  };

  const addMessage = (role: 'user' | 'assistant', content: string, strategyData?: InvestmentStrategy[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      strategies: strategyData,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userInput = inputMessage.trim();
    addMessage('user', userInput);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Build conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call ChatGPT API
      const { response } = await aiApi.chat(
        userInput,
        conversationHistory,
        profile,
        pools
      );

      // Add AI response
      addMessage('assistant', response);

      // Process user input for profile building
      processUserInput(userInput);
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      toast.error(error.message || 'Failed to get AI response');

      // Fallback to rule-based processing
      processUserInput(userInput);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserInput = (input: string) => {
    const numericValue = parseFloat(input.replace(/[^0-9.]/g, ''));

    switch (currentStep) {
      case 'investment':
        if (!isNaN(numericValue) && numericValue > 0) {
          setProfile(prev => ({ ...prev, investmentAmount: numericValue }));
          setCurrentStep('returns');
        }
        break;

      case 'returns':
        if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 1000) {
          setProfile(prev => ({ ...prev, expectedReturns: numericValue }));
          setCurrentStep('days');
        }
        break;

      case 'days':
        if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 3650) {
          setProfile(prev => ({ ...prev, investmentDays: numericValue }));
          setCurrentStep('apy');
        }
        break;

      case 'apy':
        if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 500) {
          const finalProfile: UserInvestmentProfile = {
            investmentAmount: profile.investmentAmount || 0,
            expectedReturns: profile.expectedReturns || 0,
            investmentDays: profile.investmentDays || 30,
            targetApy: numericValue,
          };
          setProfile(finalProfile);
          setCurrentStep('complete');
          generateStrategies(finalProfile);
        }
        break;

      case 'complete':
        if (input.toLowerCase().includes('regenerate') || input.toLowerCase().includes('new')) {
          setCurrentStep('investment');
          setProfile({});
          setStrategies([]);
        }
        break;
    }
  };

  const generateStrategies = (finalProfile: UserInvestmentProfile) => {
    addMessage('assistant', `Analyzing ${pools.length} available pools and generating personalized strategies for you...`);

    setTimeout(() => {
      const generatedStrategies = StrategyService.generateStrategies(finalProfile, pools);
      setStrategies(generatedStrategies);

      // Determine risk level based on days
      const riskLevel = finalProfile.investmentDays < 30 ? 'HIGH' :
                        finalProfile.investmentDays < 90 ? 'MEDIUM' : 'LOW';

      const strategyText = `Based on your profile:
• Investment: $${finalProfile.investmentAmount.toLocaleString()}
• Expected Returns: ${finalProfile.expectedReturns}%
• Investment Period: ${finalProfile.investmentDays} days
• Target APY: ${finalProfile.targetApy}%
• Risk Level: ${riskLevel} (${finalProfile.investmentDays < 30 ? 'Short term requires higher risk' : finalProfile.investmentDays < 90 ? 'Medium term with balanced risk' : 'Long term with lower risk'})

I've created ${generatedStrategies.length} personalized strategies for you! Each strategy balances risk and reward differently. Review them below and execute the one that fits your goals best.`;

      addMessage('assistant', strategyText, generatedStrategies);
    }, 1500);
  };

  const handleCustomInputSubmit = () => {
    const amount = parseFloat(customInputData.investmentAmount);
    const returns = parseFloat(customInputData.expectedReturns);
    const days = parseFloat(customInputData.investmentDays);
    const apy = parseFloat(customInputData.targetApy);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }
    if (isNaN(returns) || returns <= 0 || returns > 1000) {
      toast.error('Please enter a valid expected return (0-1000%)');
      return;
    }
    if (isNaN(days) || days <= 0 || days > 3650) {
      toast.error('Please enter a valid number of days (1-3650)');
      return;
    }
    if (isNaN(apy) || apy <= 0 || apy > 500) {
      toast.error('Please enter a valid APY (0-500%)');
      return;
    }

    const finalProfile: UserInvestmentProfile = {
      investmentAmount: amount,
      expectedReturns: returns,
      investmentDays: days,
      targetApy: apy,
    };

    // Add user message showing their custom inputs
    addMessage('user', `Custom Strategy Request:
Investment: $${amount.toLocaleString()}
Expected Returns: ${returns}%
Investment Period: ${days} days
Target APY: ${apy}%`);

    setProfile(finalProfile);
    setCurrentStep('complete');
    setShowCustomInput(false);
    generateStrategies(finalProfile);
  };

  const handleExecuteStrategy = (strategy: InvestmentStrategy) => {
    setSelectedStrategy(strategy);
    setShowExecutionModal(true);
  };

  const renderQuickActions = () => {
    if (currentStep === 'complete' || strategies.length > 0) return null;

    const quickAmounts = ['1000', '5000', '10000', '25000'];
    const quickReturns = ['10', '20', '30', '50'];
    const quickDays = ['7', '30', '90', '180', '365'];
    const quickApy = ['15', '25', '40', '60'];

    let options: string[] = [];
    let label = '';

    switch (currentStep) {
      case 'investment':
        options = quickAmounts;
        label = 'Quick amounts ($):';
        break;
      case 'returns':
        options = quickReturns;
        label = 'Quick targets (%):';
        break;
      case 'days':
        options = quickDays;
        label = 'Quick periods (days):';
        break;
      case 'apy':
        options = quickApy;
        label = 'Quick APY (%):';
        break;
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{label}</p>
          {currentStep === 'investment' && (
            <button
              onClick={() => setShowCustomInput(true)}
              className="text-xs text-white bg-[#0610ac] hover:bg-[#0610ac]/90 px-3 py-1.5 rounded-lg font-semibold transition-all"
            >
              Custom Input
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => {
                setInputMessage(option);
                setTimeout(() => handleSendMessage(), 100);
              }}
              className="px-4 py-2 bg-primary-500/15 hover:bg-primary-500/25 border border-primary-500/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            >
              {currentStep === 'investment' ? `$${option}` :
               currentStep === 'days' ? `${option} days` : `${option}%`}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-3">
      {/* Header - Compact */}
      <div className="relative overflow-hidden bg-white dark:bg-[#1a1a1f] rounded-xl shadow-coins border border-[#e8e8e8] dark:border-[#2a2a2f] p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0610ac] rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
              AI Strategy Advisor
            </h1>
            <p className="text-xs text-[#666666] dark:text-gray-400">
              Get personalized yield farming strategies powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container - Flexible height */}
      <div className="bg-white dark:bg-[#1a1a1f] rounded-xl shadow-coins border border-[#e8e8e8] dark:border-[#2a2a2f] flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages - Scrollable only */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <div
                  className={cn(
                    'flex items-start space-x-3',
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      message.role === 'assistant'
                        ? 'bg-[#0610ac]'
                        : 'bg-[#666666]'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'flex-1 max-w-[85%] p-3 rounded-lg border',
                      message.role === 'assistant'
                        ? 'bg-[#f6f8fa] dark:bg-[#1a1a1f] border-[#e8e8e8] dark:border-[#2a2a2f]'
                        : 'bg-white dark:bg-[#0d0d12] border-[#e8e8e8] dark:border-[#2a2a2f]'
                    )}
                  >
                    <p className="text-sm text-[#1a1a1a] dark:text-[#f8fafc] whitespace-pre-wrap leading-relaxed break-words">
                      {message.content}
                    </p>
                    <p className="text-xs text-[#999999] mt-1.5">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Strategies Display */}
                {message.strategies && message.strategies.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {message.strategies.map((strategy) => (
                      <StrategyCard
                        key={strategy.id}
                        strategy={strategy}
                        onExecute={handleExecuteStrategy}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#0610ac]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-[85%] p-3 rounded-lg border bg-[#f6f8fa] dark:bg-[#1a1a1f] border-[#e8e8e8] dark:border-[#2a2a2f]">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 text-[#0610ac] animate-spin" />
                    <span className="text-sm text-[#666666]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

        {/* Input Area - Fixed at bottom of chat */}
        <div className="border-t border-[#e8e8e8] dark:border-[#2a2a2f] p-3 bg-[#fafbfc] dark:bg-[#0d0d12] flex-shrink-0">
          {renderQuickActions()}

          <div className={cn("flex items-center space-x-3", renderQuickActions() ? "mt-3" : "")}>
            <Input
              type="text"
              placeholder="Type your answer..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || !inputMessage.trim()}
              className="px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards - Compact at bottom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-shrink-0">
          <div className="bg-white dark:bg-[#1a1a1f] rounded-lg shadow-coins-sm border border-[#e8e8e8] dark:border-[#2a2a2f] p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0610ac] rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Investment</p>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                  {profile.investmentAmount ? `$${profile.investmentAmount.toLocaleString()}` : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1f] rounded-lg shadow-coins-sm border border-[#e8e8e8] dark:border-[#2a2a2f] p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0610ac] rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Returns</p>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                  {profile.expectedReturns ? `${profile.expectedReturns}%` : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1f] rounded-lg shadow-coins-sm border border-[#e8e8e8] dark:border-[#2a2a2f] p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0610ac] rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Period</p>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                  {profile.investmentDays ? `${profile.investmentDays} days` : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1f] rounded-lg shadow-coins-sm border border-[#e8e8e8] dark:border-[#2a2a2f] p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0610ac] rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] dark:text-gray-400 font-semibold">Target APY</p>
                <p className="text-sm font-bold text-[#1a1a1a] dark:text-white">
                  {profile.targetApy ? `${profile.targetApy}%` : '-'}
                </p>
              </div>
            </div>
        </div>
      </div>

      {/* Strategy Execution Modal */}
      {selectedStrategy && (
        <StrategyExecutionModal
          isOpen={showExecutionModal}
          onClose={() => {
            setShowExecutionModal(false);
            setSelectedStrategy(null);
          }}
          strategy={selectedStrategy}
        />
      )}

      {/* Custom Input Modal */}
      {showCustomInput && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#e8e8e8] dark:border-[#2a2a2f] max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white">Custom Input</h3>
              <button
                onClick={() => setShowCustomInput(false)}
                className="w-8 h-8 flex items-center justify-center text-[#999999] hover:text-[#1a1a1a] dark:hover:text-white rounded-lg transition-all"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Investment Amount ($)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 10000"
                  value={customInputData.investmentAmount}
                  onChange={(e) => setCustomInputData(prev => ({ ...prev, investmentAmount: e.target.value }))}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Expected Returns (%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={customInputData.expectedReturns}
                  onChange={(e) => setCustomInputData(prev => ({ ...prev, expectedReturns: e.target.value }))}
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Investment Period (days)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 90"
                  value={customInputData.investmentDays}
                  onChange={(e) => setCustomInputData(prev => ({ ...prev, investmentDays: e.target.value }))}
                  min="1"
                  max="3650"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                  Target APY (%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={customInputData.targetApy}
                  onChange={(e) => setCustomInputData(prev => ({ ...prev, targetApy: e.target.value }))}
                  min="1"
                  max="500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustomInput(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#2a2a2f] text-[#666666] dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2f] transition-all font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomInputSubmit}
                className="flex-1 px-4 py-2 bg-[#0610ac] hover:bg-[#0610ac]/90 text-white rounded-lg transition-all font-semibold text-sm"
              >
                Generate Strategies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
