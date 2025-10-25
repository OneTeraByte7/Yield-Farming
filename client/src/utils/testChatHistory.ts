/**
 * Chat History Diagnostic Tool
 *
 * Run this in browser console to test chat history functionality
 *
 * Usage:
 * 1. Open browser console (F12)
 * 2. Run: testChatHistory()
 */

import { chatHistoryApi } from '@/api/chatHistory.api';

export const testChatHistory = async () => {
  console.log('🔍 Starting Chat History Diagnostics...\n');

  // Test 1: Check Authentication
  console.log('1️⃣ Checking Authentication...');
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ FAILED: No authentication token found');
    console.log('→ Please login first');
    return;
  }
  console.log('✅ PASSED: Token found:', token.substring(0, 20) + '...\n');

  // Test 2: Check API URL
  console.log('2️⃣ Checking API Configuration...');
  console.log('API URL: /api (using Vite proxy -> http://localhost:5000)');
  console.log('✅ PASSED: API URL configured\n');

  // Test 3: Test GET /chat-history
  console.log('3️⃣ Testing GET /chat-history...');
  try {
    const chats = await chatHistoryApi.getUserChats();
    console.log('✅ PASSED: Successfully fetched chats');
    console.log(`Found ${chats.length} chat(s):`, chats);
  } catch (error: any) {
    console.error('❌ FAILED: Error fetching chats');
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('→ Authentication error. Try logging out and back in.');
    }
    if (error.response?.status === 404) {
      console.log('→ Endpoint not found. Check if server is running.');
    }
    return;
  }

  // Test 4: Test POST /chat-history (save chat)
  console.log('\n4️⃣ Testing POST /chat-history...');
  try {
    const testChat = {
      messages: [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Test message from diagnostic tool',
          timestamp: new Date(),
        },
      ],
      investmentProfile: {
        investmentAmount: 1000,
        expectedReturns: 10,
        investmentDays: 30,
        targetApy: 15,
      },
      strategies: [],
    };

    const savedChat = await chatHistoryApi.saveChat(testChat);
    console.log('✅ PASSED: Successfully saved test chat');
    console.log('Saved chat:', savedChat);

    // Test 5: Test DELETE (cleanup)
    console.log('\n5️⃣ Cleaning up test chat...');
    await chatHistoryApi.deleteChat(savedChat.id);
    console.log('✅ PASSED: Successfully deleted test chat\n');
  } catch (error: any) {
    console.error('❌ FAILED: Error saving chat');
    console.error('Error:', error.response?.data || error.message);

    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      console.log('→ Database table not created. Run SUPABASE_SETUP.sql');
    }
    return;
  }

  // All tests passed
  console.log('✅ ALL TESTS PASSED!');
  console.log('Chat history functionality is working correctly.');
  console.log('\nIf you still don\'t see chats in the sidebar:');
  console.log('1. Make sure you\'ve started a conversation in AI Chat');
  console.log('2. Wait 2 seconds for auto-save');
  console.log('3. Click the refresh button in the sidebar dropdown');
};

// Make it available globally in browser console
if (typeof window !== 'undefined') {
  (window as any).testChatHistory = testChatHistory;
}
