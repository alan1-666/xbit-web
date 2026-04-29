import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'



export interface AgentState {
  // 邀请码相关
  invitationCodes: string
  currentLevel: any
  taskCategories: any[]
  ClaimRewardData: any
}

const initialState: AgentState = {
  invitationCodes: '',// 邀请码
  currentLevel: {}, // 当前等级信息
  taskCategories: [], // 任务类型
  ClaimRewardData: { // 奖励数据
    "claimMemeReferral": "0",
    "claimAgentReferral": "0",
    "totalAccumulatedUSD": "0"
  }, 
}


// Slice
export const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    // 设置邀请码
    setInvitationCode: (state, action: PayloadAction<string>) => {
      state.invitationCodes = action.payload
    },
    setCurrentLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload
    },
    setTaskCategories: (state, action: PayloadAction<any[]>) => {
      state.taskCategories = action.payload
    },
    setClaimRewardData: (state, action: PayloadAction<any>) => {
      state.ClaimRewardData = action.payload
    },
    reset: () => initialState
  }
})


export const { 
    setInvitationCode,
    setCurrentLevel,
    reset,
    setTaskCategories,
    setClaimRewardData
} = agentSlice.actions
export default agentSlice.reducer
