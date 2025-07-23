import React from "react";
interface BetOptionsProps {
    onSelect: (color: "green" | "red" | "violet") => void;
}
declare const BetOptions: React.FC<BetOptionsProps>;
export default BetOptions;
