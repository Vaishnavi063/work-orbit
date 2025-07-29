// Export all chat-related modules
export * from './apis';
export * from './urls';
export * from './services/chat-service';
export * from './services/chat-polling-service';

// Re-export the hooks for easier access
export { default as usePollingChat } from '@/hooks/use-polling-chat';
export { default as useChatMessages } from '@/hooks/use-chat-messages';
export { default as useChatService } from '@/hooks/use-chat-service';

// Export the ChatPage component as default
import ChatPage from './components/ChatPage';
export default ChatPage;