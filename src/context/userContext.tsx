
"use client";
// src/context/UserContext.tsx
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react';
interface UserContextValue {
    userLogin: any;
    setUserLogin: Dispatch<SetStateAction<string | null>>;
}
const UserContext = createContext<UserContextValue>({
    userLogin: null,
    setUserLogin: () => { },
});

const UserProvider = ({ children }: PropsWithChildren) => {
    const [userLogin, setUserLogin] = useState<any>();
    return (
        <UserContext.Provider value={{ userLogin, setUserLogin }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };