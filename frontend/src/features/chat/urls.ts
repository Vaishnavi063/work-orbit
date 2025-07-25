/**
 * URL constants for chat-related API endpoints
 */

const BASE_URL = "/api/chat";

export const CHAT_URLS = {
    // Message operations
    SEND_MESSAGE: `${BASE_URL}/send`,
    MARK_AS_READ: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/read`,
    GET_CHAT_HISTORY: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/messages`,
    GET_NEW_MESSAGES: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/messages/since`,

    // Chat room operations
    GET_USER_CHAT_ROOMS: `${BASE_URL}/rooms/user`,
    GET_ACTIVE_CHAT_ROOMS: `${BASE_URL}/rooms/active`,
    CREATE_BID_CHAT_ROOM: `${BASE_URL}/rooms/bid`,
    CREATE_CONTRACT_CHAT_ROOM: `${BASE_URL}/rooms/contract`,

    // Bid operations in chat
    ACCEPT_BID: (bidId: number) => `${BASE_URL}/bid/${bidId}/accept`,
    REJECT_BID: (bidId: number) => `${BASE_URL}/bid/${bidId}/reject`,

    // Details for chat context
    GET_BID_DETAILS: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/bid-details`,
    GET_CONTRACT_DETAILS: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/contract-details`,

    // Milestone operations
    GET_MILESTONES: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/milestones`,
    GET_MILESTONE_COMPLETION: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/milestone-completion`,
    GET_OVERDUE_MILESTONES: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/overdue-milestones`,
    SEND_MILESTONE_NOTIFICATION: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/milestone-notification`,
    CREATE_MILESTONE: (chatRoomId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/create-milestone`,
    UPDATE_MILESTONE_STATUS: (chatRoomId: number, milestoneId: number) =>
        `${BASE_URL}/rooms/${chatRoomId}/milestones/${milestoneId}/status`,
    DELETE_MILESTONE: (milestoneId: number) => `/api/milestones/${milestoneId}`,
    UPDATE_MILESTONE: (milestoneId: number) => `/api/milestones/${milestoneId}`,
    UPDATE_MILESTONE_STATUS_DIRECT: (milestoneId: number) => `/api/milestones/${milestoneId}/status`,
    CREATE_MILESTONE_DIRECT: (contractId: number) => `/api/milestones/contract/${contractId}`,
};

export default CHAT_URLS;
