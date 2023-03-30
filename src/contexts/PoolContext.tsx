import {createContext} from "react";

export const PoolsContext = createContext<{chosenPoolsMemoized: any[]}>({ chosenPoolsMemoized: [] })