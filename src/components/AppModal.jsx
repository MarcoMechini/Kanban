import { useEffect, useRef } from "react";

export default function AppModal({ isOpen, value, setModal, onConfirm }) {
    const inputRef = useRef(null);

    useEffect(() => {
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
        const { name, value } = e.target
        if (name === 'colName') {
            setModal(prev => ({ isOpen: prev.isOpen, value: { ...prev.value, name: value } }));
        }
        if (name === 'desc') {
            setModal(prev => ({ isOpen: prev.isOpen, value: { ...prev.value, desc: value } }));
        }
        if (name === 'title') {
            setModal(prev => ({ isOpen: prev.isOpen, value: { ...prev.value, name: value } }));
        }
    };

    if (value.colId && !value.tasks) {
        return (
            <div className={`modal-overlay ${isOpen ? 'modal-overlay-visible' : 'modal-overlay-hidden'}`}>
                <div className="modal-content">
                    <label htmlFor="title">Titolo task</label>
                    <input
                        type="text"
                        id="title"
                        name='title'
                        value={value.name || ''} // Ensure value is not undefined
                        onChange={handleChange}
                        onKeyUp={handleKeyUp}
                        ref={inputRef}
                    />
                    <label htmlFor="desc">Descrizione</label>
                    <input
                        type="text"
                        id="desc"
                        name="desc"
                        value={value.desc || ''} // Ensure value is not undefined
                        onChange={handleChange}
                        onKeyUp={handleKeyUp}
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
    }

    return (
        <div className={`modal-overlay ${isOpen ? 'modal-overlay-visible' : 'modal-overlay-hidden'}`}>
            <div className="modal-content">
                <label htmlFor="name">Nome Colonna</label>
                <input
                    type="text"
                    id="name"
                    name="colName"
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