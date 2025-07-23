import React from "react";
interface User {
    id?: string;
    name: string;
    mobile?: string;
    referralCode: string;
    avatarUrl?: string;
}
interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}
export declare const AuthProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useAuth: () => AuthContextType;
export {};
