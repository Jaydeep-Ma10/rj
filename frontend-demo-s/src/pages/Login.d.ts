interface LoginProps {
    setNotif?: (n: {
        message: string;
        type?: "success" | "error";
    }) => void;
}
declare const Login: ({ setNotif }: LoginProps) => import("react/jsx-runtime").JSX.Element;
export default Login;
