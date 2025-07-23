import React from "react";
interface BetModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOption: string;
    roundId: number | null;
    onSuccess?: () => void;
}
declare const BetModal: React.FC<BetModalProps>;
export default BetModal;
