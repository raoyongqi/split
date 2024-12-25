import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchsearch,} from '../store/search-slice';  // 引入 Redux 中的异步操作 `fetchsongs` 和 `Habit` 类型
import { LinearProgress, Typography } from '@mui/material';  // 引入 Material-UI 组件，显示加载进度条、纸张容器和文本

import { AppDispatch, RootState} from '../store/store';  // 引入应用的 dispatch 和 Redux 状态根类型

const SearchStat: React.FC = () => {
   // 使用 `useSelector` 从 Redux store 中获取习惯数据状态
   const {isLoading, error } = useSelector((state: RootState) => state.search);  // 获取习惯数据、加载状态和错误信息
   const dispatch = useDispatch<AppDispatch>();  // 获取 dispatch 用于派发 Redux actions

   useEffect(() => {
       dispatch( fetchsearch());  // 组件加载时调用异步 action `fetchsongs` 获取数据
    }, []);  // 依赖数组为空，表示只在组件挂载时执行一次


   // 如果数据正在加载中，显示进度条
   if(isLoading){
      return <LinearProgress />;  // 显示 Material-UI 提供的进度条
   }

   // 如果发生错误，显示错误信息
   if(error){
      return <Typography color="error">{error}</Typography>;  // 显示错误信息，字体颜色为红色
   }
   return (
      <div>

      </div>
    );
};

export default SearchStat;  // 导出该组件供其他地方使用
