import React from "react";
interface Props {
    onSelect: (multiplier: number | "Random") => void;
}
declare const MultiplierGrid: React.FC<Props>;
export default MultiplierGrid;
