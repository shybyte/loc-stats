import { SccResult } from "./scc";


export const COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']

export interface Project {
    name: string;
    url: string;
    sccResult: SccResult;
    data: XyTupel[];
    color: string;
  }
  
  export type XyTupel = [number, number];