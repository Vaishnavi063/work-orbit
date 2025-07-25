import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { chatApis } from '@/features/chat/apis';
import type { RootState } from '@/store';

interface ChatRoom {
  id: number;
  chatType: 'BID_NEGOTIATION' | 'CONTRACT';
  referenceId: number;
  otherParty: {
    id: number;
    name: string;
    type: 'CLIENT' | 'FREELANCER';
  };
  lastMessage?: {
    id: number;
    content: string;
    createdAt: string;
    senderType: string;
  };
  unreadCount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chatRooms: ChatRoom[];
  totalUnreadCount: number;
  loading: {
    chatRooms: boolean;
  };
  error: {
    chatRooms: string | null;
  };
}

const initialState: ChatState = {
  chatRooms: [],
  totalUnreadCount: 0,
  loading: {
    chatRooms: false,
  },
  error: {
    chatRooms: null,
  },
};

// Async thunks
export const fetchUserChatRooms = createAsyncThunk(
  'chat/fetchUserChatRooms',
  async ({ authToken }: { authToken: string }, { rejectWithValue }) => {
    try {
      const response = await chatApis.getUserChatRooms(authToken);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchActiveChatRooms = createAsyncThunk(
  'chat/fetchActiveChatRooms',
  async ({ authToken }: { authToken: string }, { rejectWithValue }) => {
    try {
      const response = await chatApis.getActiveChatRooms(authToken);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to fetch active chat rooms');
    }
  }
);

export const markChatAsRead = createAsyncThunk(
  'chat/markChatAsRead',
  async ({ chatRoomId, authToken }: { chatRoomId: number; authToken: string }, { rejectWithValue }) => {
    try {
      await chatApis.markAsRead({ chatRoomId, authToken });
      return chatRoomId;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to mark chat as read');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateUnreadCount: (state, action: PayloadAction<{ chatRoomId: number; unreadCount: number }>) => {
      const { chatRoomId, unreadCount } = action.payload;
      const chatRoom = state.chatRooms.find(room => room.id === chatRoomId);
      
      if (chatRoom) {
        // Calculate the difference in unread count
        const oldUnreadCount = chatRoom.unreadCount;
        const difference = unreadCount - oldUnreadCount;
        
        // Update the chat room's unread count
        chatRoom.unreadCount = unreadCount;
        
        // Update the total unread count
        state.totalUnreadCount = Math.max(0, state.totalUnreadCount + difference);
      }
    },
    
    addNewMessage: (state, action: PayloadAction<{ chatRoomId: number; message: any; isCurrentUser: boolean }>) => {
      const { chatRoomId, message, isCurrentUser } = action.payload;
      const chatRoom = state.chatRooms.find(room => room.id === chatRoomId);
      
      if (chatRoom) {
        // Update last message
        chatRoom.lastMessage = {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          senderType: message.senderType
        };
        
        // Update unread count if the message is not from the current user
        if (!isCurrentUser) {
          chatRoom.unreadCount += 1;
          state.totalUnreadCount += 1;
        }
        
        // Move this chat room to the top of the list
        const index = state.chatRooms.findIndex(room => room.id === chatRoomId);
        if (index > 0) {
          const [movedRoom] = state.chatRooms.splice(index, 1);
          state.chatRooms.unshift(movedRoom);
        }
      }
    },
    
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchUserChatRooms
      .addCase(fetchUserChatRooms.pending, (state) => {
        state.loading.chatRooms = true;
        state.error.chatRooms = null;
      })
      .addCase(fetchUserChatRooms.fulfilled, (state, action) => {
        state.chatRooms = action.payload;
        state.totalUnreadCount = action.payload.reduce(
          (total: number, room: ChatRoom) => total + room.unreadCount, 
          0
        );
        state.loading.chatRooms = false;
      })
      .addCase(fetchUserChatRooms.rejected, (state, action) => {
        state.loading.chatRooms = false;
        state.error.chatRooms = action.payload as string;
      })
      
      // fetchActiveChatRooms
      .addCase(fetchActiveChatRooms.pending, (state) => {
        state.loading.chatRooms = true;
        state.error.chatRooms = null;
      })
      .addCase(fetchActiveChatRooms.fulfilled, (state, action) => {
        state.chatRooms = action.payload;
        state.totalUnreadCount = action.payload.reduce(
          (total: number, room: ChatRoom) => total + room.unreadCount, 
          0
        );
        state.loading.chatRooms = false;
      })
      .addCase(fetchActiveChatRooms.rejected, (state, action) => {
        state.loading.chatRooms = false;
        state.error.chatRooms = action.payload as string;
      })
      
      // markChatAsRead
      .addCase(markChatAsRead.fulfilled, (state, action) => {
        const chatRoomId = action.payload;
        const chatRoom = state.chatRooms.find(room => room.id === chatRoomId);
        
        if (chatRoom) {
          // Subtract the chat room's unread count from the total
          state.totalUnreadCount = Math.max(0, state.totalUnreadCount - chatRoom.unreadCount);
          // Reset the chat room's unread count
          chatRoom.unreadCount = 0;
        }
      });
  },
});

// Actions
export const { updateUnreadCount, addNewMessage, resetChatState } = chatSlice.actions;

// Selectors
export const selectChatRooms = (state: RootState) => state.chat.chatRooms;
export const selectTotalUnreadCount = (state: RootState) => state.chat.totalUnreadCount;
export const selectChatLoading = (state: RootState) => state.chat.loading;
export const selectChatError = (state: RootState) => state.chat.error;

export default chatSlice.reducer;