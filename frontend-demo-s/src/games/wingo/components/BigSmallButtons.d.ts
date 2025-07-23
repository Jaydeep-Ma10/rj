import React from "react";
interface Props {
    onSelect: (choice: "big" | "small") => void;
}
declare const BigSmallButtons: React.FC<Props>;
export default BigSmallButtons;
