interface SignupProps {
    setNotif?: (n: {
        message: string;
        type?: "success" | "error";
    }) => void;
}
declare const Signup: ({ setNotif }: SignupProps) => import("react/jsx-runtime").JSX.Element;
export default Signup;
