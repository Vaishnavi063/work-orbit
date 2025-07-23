import request from '@/apis/request';

interface SendMessageParams {
  chatRoomId: number;
  content: string;
  authToken: string;
}

interface GetChatHistoryParams {
  chatRoomId: number;
  page?: number;
  size?: number;
  authToken: string;
}

interface GetNewMessagesParams {
  chatRoomId: number;
  since: string;
  authToken: string;
}

interface MarkAsReadParams {
  chatRoomId: number;
  authToken: string;
}

export const chatApis = {
  /**
   * Get all chat rooms for the current user
   */
  getUserChatRooms: (authToken: string) => {
    return request({
      method: 'GET',
      url: '/api/chat/rooms/user',
      authToken,
    });
  },

  /**
   * Get active chat rooms for the current user
   */
  getActiveChatRooms: (authToken: string) => {
    return request({
      method: 'GET',
      url: '/api/chat/rooms/active',
      authToken,
    });
  },

  /**
   * Get chat history for a specific chat room
   */
  getChatHistory: ({ chatRoomId, page = 0, size = 50, authToken }: GetChatHistoryParams) => {
    return request({
      method: 'GET',
      url: `/api/chat/rooms/${chatRoomId}/messages`,
      params: { page, size, sort: 'createdAt,desc' },
      authToken,
    });
  },

  /**
   * Send a message in a chat room
   */
  sendMessage: ({ chatRoomId, content, authToken }: SendMessageParams) => {
    return request({
      method: 'POST',
      url: '/api/chat/send',
      data: { chatRoomId, content },
      authToken,
    });
  },

  /**
   * Mark all messages in a chat room as read
   */
  markAsRead: ({ chatRoomId, authToken }: MarkAsReadParams) => {
    return request({
      method: 'POST',
      url: `/api/chat/rooms/${chatRoomId}/read`,
      authToken,
    });
  },
  
  /**
   * Get new messages since a specific timestamp
   */
  getNewMessages: ({ chatRoomId, since, authToken }: GetNewMessagesParams) => {
    return request({
      method: 'GET',
      url: `/api/chat/rooms/${chatRoomId}/messages/since`,
      params: { since },
      authToken,
    });
  },

  /**
   * Get bid details for a chat room
   */
  getBidDetailsForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: `/api/chat/rooms/${chatRoomId}/bid-details`,
      authToken,
    });
  },

  /**
   * Get contract details for a chat room
   */
  getContractDetailsForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: `/api/chat/rooms/${chatRoomId}/contract-details`,
      authToken,
    });
  },

  /**
   * Accept a bid through chat interface
   */
  acceptBidInChat: (bidId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: `/api/chat/bid/${bidId}/accept`,
      authToken,
    });
  },

  /**
   * Reject a bid through chat interface
   */
  rejectBidInChat: (bidId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: `/api/chat/bid/${bidId}/reject`,
      authToken,
    });
  },
}; 