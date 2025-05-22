import React, { useEffect, useRef, useState } from 'react';


const AppModal = ({ isOpen, value, setModal, onConfirm }) => {
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
    setModal(prev => ({ isOpen: prev.isOpen, value: { ...prev.value, name: e.target.value } }));
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'modal-overlay-visible' : 'modal-overlay-hidden'}`}>
      <div className="modal-content">
        <label htmlFor="name">Nome Colonna</label>
        <input
          type="text"
          id="name"
          value={value.name || ''}
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


function App() {

  const [column, setColumn] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, value: {} });

  const addColumn = () => {
    const newColumn = {
      id: Date.now(),
      name: 'Nuova Colonna',
      tasks: [{ title: 'Nuovo Task', desc: 'Descrizione del Task' }]
    };
    setColumn(prev => [...prev, newColumn]);
  };

  const addTask = (_, col) => {
    setColumn(prev => prev.map(c => {
      if (c.id === col.id) {
        return { ...c, tasks: [...c.tasks, { title: 'Nuovo Task', desc: 'Descrizione del Task' }] };
      }
      return c;
    }));
  };

  const handleConfirm = () => {
    setColumn(prev => prev.map(col => {
      if (col.id === modal.value.id) {
        return { ...col, name: modal.value.name };
      }
      return col;
    }));
    setModal(prev => ({ isOpen: false, value: prev.value }));
  };

  const handleModal = (col) => {
    setModal(prev => ({
      isOpen: true,
      value: col
    }));
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Kanban Board</h1>
      <h2 className="subtitle">Organizza i tuoi Task</h2>

      <nav>
        <button
          onClick={addColumn}
          className="add-column-button"
        >

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-14.561 14.56a2.625 2.625 0 0 0 0 3.712l3.713 3.713a2.625 2.625 0 0 0 3.712 0l14.56-14.561a2.625 2.625 0 0 0 0-3.712l-3.713-3.713Zm-10.318 7.375l-2.121 2.121a1.5 1.5 0 0 1-2.121 0l-.375-.375a1.5 1.5 0 0 1 0-2.121l2.121-2.121a1.5 1.5 0 0 1 2.121 0l.375.375a1.5 1.5 0 0 1 0 2.121Z" />
          </svg>
          Aggiungi Colonna
        </button>
      </nav>

      <section className="kanban">
        {column.map((col) => (
          <div key={col.id} className="column-card">
            <div className="col-header">
              <h3>{col.name}</h3>
              <button
                className="edit-name-button"
                onClick={() => handleModal(col)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                  <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="col-body">
              <button
                onClick={e => addTask(e, col)}
                className="add-task-button"
              >
                + Aggiungi Task
              </button>
              {col.tasks.map((task, index) => (
                <div key={index} className="tasks-row">
                  <h4>{task.title}</h4>
                  <p>{task.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <AppModal
        isOpen={modal.isOpen}
        value={modal.value}
        onConfirm={handleConfirm}
        setModal={setModal}
      />
    </div>
  );
}

export default App;
