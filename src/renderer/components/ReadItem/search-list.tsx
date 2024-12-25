import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { removeSearch } from "../store/search-slice";
import { useRef, useEffect } from 'react';

const SearchList: React.FC = () => {
  // 获取 `search` 状态
  const { search } = useSelector((state: RootState) => state.search);

  const dispatch = useDispatch<AppDispatch>();

  return (
    <Box>
      {/* 显示 search 数组的长度 */}
      <Typography variant="h6">
        Search Length: {search.length}
      </Typography>
      
      {/* 其他组件内容 */}
    
    </Box>
  );
};

export default SearchList;
