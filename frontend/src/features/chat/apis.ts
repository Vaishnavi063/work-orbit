import request from '@/apis/request';
import { CHAT_URLS } from './urls';

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
   * Create a chat room for a bid
   */
  createBidChatRoom: (bidId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.CREATE_BID_CHAT_ROOM,
      data: { bidId },
      authToken,
    });
  },
  
  /**
   * Get or create a chat room for a contract
   */
  getContractChatRoom: (contractId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.CREATE_CONTRACT_CHAT_ROOM,
      data: { contractId },
      authToken,
    });
  },

  /**
   * Get all chat rooms for the current user
   */
  getUserChatRooms: (authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_USER_CHAT_ROOMS,
      authToken,
    });
  },

  /**
   * Get active chat rooms for the current user
   */
  getActiveChatRooms: (authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_ACTIVE_CHAT_ROOMS,
      authToken,
    });
  },

  /**
   * Get chat history for a specific chat room
   */
  getChatHistory: ({ chatRoomId, page = 0, size = 50, authToken }: GetChatHistoryParams) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_CHAT_HISTORY(chatRoomId),
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
      url: CHAT_URLS.SEND_MESSAGE,
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
      url: CHAT_URLS.MARK_AS_READ(chatRoomId),
      authToken,
    });
  },
  
  /**
   * Get new messages since a specific timestamp
   */
  getNewMessages: ({ chatRoomId, since, authToken }: GetNewMessagesParams) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_NEW_MESSAGES(chatRoomId),
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
      url: CHAT_URLS.GET_BID_DETAILS(chatRoomId),
      authToken,
    });
  },

  /**
   * Get contract details for a chat room
   */
  getContractDetailsForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_CONTRACT_DETAILS(chatRoomId),
      authToken,
    });
  },

  /**
   * Accept a bid through chat interface
   */
  acceptBidInChat: (bidId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.ACCEPT_BID(bidId),
      authToken,
    });
  },

  /**
   * Reject a bid through chat interface
   */
  rejectBidInChat: (bidId: number, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.REJECT_BID(bidId),
      authToken,
    });
  },
  
  /**
   * Get milestones for a contract chat
   */
  getMilestonesForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_MILESTONES(chatRoomId),
      authToken,
    });
  },
  
  /**
   * Get milestone completion percentage for a contract chat
   */
  getMilestoneCompletionForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_MILESTONE_COMPLETION(chatRoomId),
      authToken,
    });
  },
  
  /**
   * Get overdue milestones for a contract chat
   */
  getOverdueMilestonesForChat: (chatRoomId: number, authToken: string) => {
    return request({
      method: 'GET',
      url: CHAT_URLS.GET_OVERDUE_MILESTONES(chatRoomId),
      authToken,
    });
  },
  
  /**
   * Send a milestone notification to a contract chat
   */
  sendMilestoneNotification: (chatRoomId: number, notification: string, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.SEND_MILESTONE_NOTIFICATION(chatRoomId),
      data: { notification },
      authToken,
    });
  },
  
  /**
   * Create a milestone from a contract chat
   */
  createMilestoneFromChat: (chatRoomId: number, milestoneData: any, authToken: string) => {
    return request({
      method: 'POST',
      url: CHAT_URLS.CREATE_MILESTONE(chatRoomId),
      data: milestoneData,
      authToken,
    });
  },
  
  /**
   * Update a milestone status from a contract chat
   */
  updateMilestoneStatusFromChat: (chatRoomId: number, milestoneId: number, status: string, authToken: string) => {
    return request({
      method: 'PUT',
      url: CHAT_URLS.UPDATE_MILESTONE_STATUS(chatRoomId, milestoneId),
      data: { status },
      authToken,
    });
  },
};