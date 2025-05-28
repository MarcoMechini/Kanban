import { useEffect, useRef } from "react";

export default function AppModal({ isOpen, value, setModal, onConfirm }) {
    const inputRef = useRef(null);

    useEffect(() => {
        // console.log('modal value', value);
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            onConfirm();
        }
    };

    const handleChange = (e) => {
        setModal(prev => ({ isOpen: prev.isOpen, value: { ...prev.value, name: e.target.value } }));
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'modal-overlay-visible' : 'modal-overlay-hidden'}`}>
            <div className="modal-content">
                <label htmlFor="name">Nome Colonna</label>
                <input
                    type="text"
                    id="name"
                    value={value.name || ''} // Ensure value is not undefined
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                    ref={inputRef}
                />
                <div className="modal-buttons">
                    <button
                        onClick={() => setModal(prev => ({ isOpen: false, value: prev.value }))}
                        className="modal-button modal-button-close"
                    >
                        Chiudi
                    </button>
                    <button
                        onClick={onConfirm}
                        className="modal-button modal-button-confirm"
                    >
                        Conferma
                    </button>
                </div>
            </div>
        </div>
    );
};