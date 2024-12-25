import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"


interface searchstate {
    search: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: searchstate = {
  search: [],
    isLoading: false,
    error: null,
}

export const fetchsearch = createAsyncThunk("input/search", async () => {
  
    return await window.electronAPI.readSearch();  // Return the data
  });
  
// 创建一个名为 "songs" 的 slice，用于处理（songs）状态的更新
const searchslice = createSlice({
    name: "search",  // 定义该 slice 的名称为 "search"，用于标识该 slice
    initialState,  // 初始状态，通常会定义一个包含默认值的状态对象
    reducers: {  // 定义同步操作（reducers），用于处理 state 的变化

        // 删除指定的song
        removeSearch: (
            state,
            action: PayloadAction<{ id: string }>  // action 中包含song的 ID
        ) => {
            // 找到要删除的song在 songs 数组中的索引
                // 输出要删除的song的 ID 和找到的索引
            const index = state.search.findIndex((h) => h === action.payload.id);


            // 如果找到了该song（index 不为 -1），则从 songs 数组中删除
            if (index > -1) {
                state.search.splice(index, 1);
            }
        },

    },

    // 处理异步操作的 extraReducers，通常用于与外部数据交互（如 API 请求）
    extraReducers: (builder) => {
        builder
          // 处理 fetchsearch 的 pending 状态，表示请求正在进行中
          .addCase(fetchsearch.pending, (state) => {
            state.isLoading = true;  // 设置 isLoading 为 true，表示正在加载
          })
          // 处理 fetchsearch 的 fulfilled 状态，表示请求成功
          .addCase(fetchsearch.fulfilled, (state, action) => {
            state.isLoading = false;  // 设置 isLoading 为 false，表示加载完成
            state.search = action.payload;  // 将返回的数据存入 songs 数组
          })
          // 处理 fetchsearch 的 rejected 状态，表示请求失败
          .addCase(fetchsearch.rejected, (state, action) => {
            state.isLoading = false;  // 设置 isLoading 为 false，表示加载完成
            state.error = action.error.message || "Failed to fetch songs";  // 设置错误信息
          });
      },

})


export const { removeSearch } = searchslice.actions;
export default searchslice.reducer;