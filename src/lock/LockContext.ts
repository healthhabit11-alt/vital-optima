import { createContext, useContext } from 'react';

export const LockContext = createContext<{ unlock: () => void }>({ unlock: () => {} });
export const useLockUnlock = () => useContext(LockContext).unlock;
