import { configureStore } from "@reduxjs/toolkit";  // 从 Redux Toolkit 导入 configureStore，用于简化 Redux store 的配置过程
import searchReducer from './search-slice'  // 导入 songsSlice 的 reducer，它处理关于习惯（songs）状态的更新逻辑


// 配置 Redux store
const store =  configureStore({
    reducer: {
        search: searchReducer,
    },
})

// 这行代码通过返回 store.getState 的返回类型来推断整个 Redux store 的状态类型
export type RootState = ReturnType<typeof store.getState>;  

// 这行代码提取 dispatch 的类型，确保在 dispatch action 时，TypeScript 可以自动推断正确的类型
export type AppDispatch = typeof store.dispatch;  // TypeScript 会帮助我们识别正确的 dispatch 类型，并确保它与 action 匹配

export default store;  // 导出配置好的 Redux store，以便在应用的其他部分使用
