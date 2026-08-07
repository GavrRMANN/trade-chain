import {createSlice} from "@reduxjs/toolkit";

type TProductState = {
    isInit: boolean;

}

const initialState: TProductState = {
    isInit: false,
}

export const productSlice = createSlice({
   name: 'product',
   initialState,
   reducers: {

   }
});