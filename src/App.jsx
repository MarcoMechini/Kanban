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

function App() {

  const [column, setColumn] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, value: {} });

  // Refs to store data about the currently dragged item
  const draggedItem = useRef(null); // Stores { type: 'column' | 'task', id: string, sourceColumnId?: string }

  // Helper function to reorder an array immutably
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Helper function to move an item from one list to another immutably
  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  const addColumn = () => {
    const newColumn = {
      id: Date.now().toString(), // Unique ID for column
      name: 'Nuova Colonna',
      tasks: [{ id: Date.now().toString() + '-task', title: 'Nuovo Task', desc: 'Descrizione del Task' }] // Unique ID for task
    };
    setColumn(prev => [...prev, newColumn]);
  };

  const addTask = (_, col) => {
    setColumn(prev => prev.map(c => {
      if (c.id === col.id) {
        return { ...c, tasks: [...c.tasks, { id: Date.now().toString() + '-task', title: 'Nuovo Task', desc: 'Descrizione del Task' }] };
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

  // --- Drag & Drop Handlers ---

  const handleColumnDragStart = (e, colId) => {
    // Inizia la funzione 'handleColumnDragStart' che viene chiamata quando si inizia a trascinare una colonna.
    // 'e' è l'oggetto dell'evento di trascinamento, 'colId' è l'ID della colonna che viene trascinata.
    draggedItem.current = { type: 'column', id: colId };
    // Assegna all'oggetto 'draggedItem.current'
    // un oggetto che indica che l'elemento trascinato è una 'column' e ne memorizza l'ID.
    e.dataTransfer.setData('columnId', colId);
    // Imposta i dati che verranno trasferiti durante l'operazione di trascinamento.
    // In questo caso, viene impostato l'ID della colonna con la chiave 'columnId'.
  };

  const handleColumnDragOver = (e) => {
    // Inizia la funzione 'handleColumnDragOver' che viene chiamata quando una colonna trascinata passa sopra un elemento valido.
    // 'e' è l'oggetto dell'evento di trascinamento.
    e.preventDefault();
    // Impedisce il comportamento predefinito del browser per l'evento 'dragover'.
    // Questo è essenziale per consentire l'operazione di "drop" (rilascio) sull'elemento.
  };

  const handleColumnDrop = (e, targetColId) => {
    // Inizia la funzione 'handleColumnDrop' che viene chiamata quando una colonna viene rilasciata.
    // 'e' è l'oggetto dell'evento di trascinamento, 'targetColId' è l'ID della colonna su cui è stata rilasciata.
    e.preventDefault();
    // Impedisce il comportamento predefinito del browser per l'evento 'drop'.
    const draggedColId = e.dataTransfer.getData('columnId');
    // Recupera l'ID della colonna che è stata trascinata dai dati trasferiti.

    if (draggedColId === targetColId || !draggedColId) {
      // Controlla se la colonna trascinata è la stessa su cui è stata rilasciata
      // o se non c'è un ID di colonna trascinata valido.
      return; // Dropped on itself or no column ID
      // Se la condizione è vera, la funzione termina senza fare nulla.
    }

    setColumn(prevColumns => {
      // Aggiorna lo stato delle colonne utilizzando la funzione 'setColumn' (probabilmente una funzione 'setState' di React).
      // 'prevColumns' rappresenta lo stato precedente delle colonne.
      const draggedIndex = prevColumns.findIndex(col => col.id === draggedColId);
      // Trova l'indice della colonna trascinata nell'array 'prevColumns'.
      const targetIndex = prevColumns.findIndex(col => col.id === targetColId);
      // Trova l'indice della colonna di destinazione nell'array 'prevColumns'.

      if (draggedIndex === -1 || targetIndex === -1) return prevColumns;
      // Se una delle colonne (trascinata o di destinazione) non viene trovata,
      // restituisce l'array di colonne precedente senza modifiche.

      return reorder(prevColumns, draggedIndex, targetIndex);
      // Richiama una funzione 'reorder' (non definita in questo snippet, ma presumibilmente
      // riorganizza l'array spostando l'elemento dall'indice 'draggedIndex' all'indice 'targetIndex')
      // e restituisce il nuovo array riorganizzato.
    });
    draggedItem.current = null; // Clear dragged item ref
    // Azzera il riferimento all'elemento trascinato, indicando che l'operazione di trascinamento è terminata.
  };

  // Task Drag Handlers
  // Questa sezione del codice gestisce il trascinamento delle "task" (elementi all'interno delle colonne).
  const handleTaskDragStart = (e, taskId, columnId) => {
    // Inizia la funzione 'handleTaskDragStart' quando si inizia a trascinare una task.
    // 'e' è l'oggetto dell'evento, 'taskId' è l'ID della task, 'columnId' è l'ID della colonna di origine.
    draggedItem.current = { type: 'task', id: taskId, sourceColumnId: columnId };
    // Assegna all'oggetto 'draggedItem.current' un oggetto che indica che l'elemento è una 'task'
    // e memorizza il suo ID e l'ID della colonna di origine.
    e.dataTransfer.setData('taskId', taskId);
    // Imposta l'ID della task nei dati trasferiti.
    e.dataTransfer.setData('sourceColumnId', columnId);
    // Imposta l'ID della colonna di origine nei dati trasferiti.
  };

  const handleTaskDragOver = (e) => {
    // Inizia la funzione 'handleTaskDragOver' quando una task trascinata passa sopra un elemento valido.
    // 'e' è l'oggetto dell'evento.
    e.preventDefault(); // Necessary to allow dropping
    // Impedisce il comportamento predefinito del browser per consentire il "drop".
  };

  const handleTaskDrop = (e, targetTaskId, targetColumnId) => {
    // Inizia la funzione 'handleTaskDrop' quando una task viene rilasciata su un'altra task.
    // 'e' è l'oggetto dell'evento, 'targetTaskId' è l'ID della task di destinazione,
    // 'targetColumnId' è l'ID della colonna di destinazione.
    e.preventDefault();
    // Impedisce il comportamento predefinito del browser.
    const draggedTaskId = e.dataTransfer.getData('taskId');
    // Recupera l'ID della task trascinata.
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    // Recupera l'ID della colonna di origine della task trascinata.

    if (!draggedTaskId || !sourceColumnId) {
      // Controlla se mancano i dati della task trascinata o della colonna di origine.
      return; // No task data
      // Se la condizione è vera, la funzione termina.
    }

    // Find the dragged task object
    // Cerca l'oggetto della task trascinata.
    let draggedTask = null;
    // Inizializza una variabile per memorizzare l'oggetto della task trascinata.
    setColumn(prevColumns => {
      // Aggiorna lo stato delle colonne.
      const newColumns = prevColumns.map(col => {
        // Mappa sull'array delle colonne precedenti per creare un nuovo array.
        if (col.id === sourceColumnId) {
          // Se la colonna corrente è la colonna di origine della task trascinata.
          draggedTask = col.tasks.find(task => task.id === draggedTaskId);
          // Trova l'oggetto della task trascinata all'interno delle task di questa colonna.
          return { ...col, tasks: col.tasks.filter(task => task.id !== draggedTaskId) };
          // Restituisce una nuova colonna (immutabile) con la task trascinata rimossa dal suo array di task.
        }
        return col;
        // Restituisce la colonna invariata se non è la colonna di origine.
      });

      if (!draggedTask) return prevColumns; // Task not found
      // Se la task trascinata non è stata trovata, restituisce le colonne precedenti senza modifiche.

      return newColumns.map(col => {
        // Mappa sul nuovo array di colonne (dove la task è stata rimossa dalla sua colonna di origine).
        if (col.id === targetColumnId) {
          // Se la colonna corrente è la colonna di destinazione.
          const targetTaskIndex = col.tasks.findIndex(task => task.id === targetTaskId);
          // Trova l'indice della task di destinazione all'interno delle task di questa colonna.
          const newTasks = Array.from(col.tasks);
          // Crea una copia mutabile dell'array di task della colonna di destinazione.
          // Insert the dragged task at the target position
          // Inserisce la task trascinata nella posizione di destinazione.
          newTasks.splice(targetTaskIndex !== -1 ? targetTaskIndex : newTasks.length, 0, draggedTask);
          // Utilizza 'splice' per inserire la 'draggedTask'.
          // Se 'targetTaskIndex' è valido (non -1), inserisce la task a quell'indice;
          // altrimenti, la inserisce alla fine dell'array ('newTasks.length').
          // '0' indica che non vengono rimossi elementi esistenti.
          return { ...col, tasks: newTasks };
          // Restituisce una nuova colonna con l'array di task aggiornato.
        }
        return col;
        // Restituisce la colonna invariata se non è la colonna di destinazione.
      });
    });
    draggedItem.current = null; // Clear dragged item ref
    // Azzera il riferimento all'elemento trascinato.
  };

  // Handle dropping a task into a column body (empty column or at the end)
  // Gestisce il rilascio di una task nel corpo di una colonna (colonna vuota o alla fine).
  const handleTaskDropIntoColumnBody = (e, targetColumnId) => {
    // Inizia la funzione 'handleTaskDropIntoColumnBody' quando una task viene rilasciata sul corpo di una colonna.
    // 'e' è l'oggetto dell'evento, 'targetColumnId' è l'ID della colonna di destinazione.
    e.preventDefault();
    // Impedisce il comportamento predefinito del browser.
    const draggedTaskId = e.dataTransfer.getData('taskId');
    // Recupera l'ID della task trascinata.
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    // Recupera l'ID della colonna di origine.

    if (!draggedTaskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      // Controlla se mancano i dati della task o della colonna di origine,
      // o se la task viene rilasciata nella stessa colonna da cui proviene (questo caso è gestito da 'handleTaskDrop').
      return; // No task data or dropping into the same column (handled by task drop)
      // Se la condizione è vera, la funzione termina.
    }

    // Find the dragged task object
    // Cerca l'oggetto della task trascinata.
    let draggedTask = null;
    // Inizializza una variabile per memorizzare l'oggetto della task trascinata.
    setColumn(prevColumns => {
      // Aggiorna lo stato delle colonne.
      const newColumns = prevColumns.map(col => {
        // Mappa sull'array delle colonne precedenti.
        if (col.id === sourceColumnId) {
          // Se la colonna corrente è la colonna di origine.
          draggedTask = col.tasks.find(task => task.id === draggedTaskId);
          // Trova l'oggetto della task trascinata.
          return { ...col, tasks: col.tasks.filter(task => task.id !== draggedTaskId) };
          // Restituisce una nuova colonna con la task rimossa.
        }
        return col;
        // Restituisce la colonna invariata.
      });

      if (!draggedTask) return prevColumns; // Task not found
      // Se la task non è stata trovata, restituisce le colonne precedenti.

      return newColumns.map(col => {
        // Mappa sul nuovo array di colonne.
        if (col.id === targetColumnId) {
          // Se la colonna corrente è la colonna di destinazione.
          return { ...col, tasks: [...col.tasks, draggedTask] };
          // Restituisce una nuova colonna con la task trascinata aggiunta alla fine dell'array di task.
          // Questo gestisce il caso in cui la task viene rilasciata in una colonna vuota o alla fine di una colonna esistente.
        }
        return col;
        // Restituisce la colonna invariata.
      });
    });
    draggedItem.current = null; // Clear dragged item ref
    // Azzera il riferimento all'elemento trascinato.
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
          {/* SVG for a pen/square icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-14.561 14.56a2.625 2.625 0 0 0 0 3.712l3.713 3.713a2.625 2.625 0 0 0 3.712 0l14.56-14.561a2.625 2.625 0 0 0 0-3.712l-3.713-3.713Zm-10.318 7.375l-2.121 2.121a1.5 1.5 0 0 1-2.121 0l-.375-.375a1.5 1.5 0 0 1 0-2.121l2.121-2.121a1.5 1.5 0 0 1 2.121 0l.375.375a1.5 1.5 0 0 1 0 2.121Z" />
          </svg>
          Aggiungi Colonna
        </button>
      </nav>

      <section className="kanban">
        {column.map((col) => (
          <div
            key={col.id}
            className="column-card"
          >
            <div className="col-header"
              draggable="true"
              onDragStart={(e) => handleColumnDragStart(e, col.id)}
              onDragOver={handleColumnDragOver}
              onDrop={(e) => handleColumnDrop(e, col.id)}>
              <h3>{col.name}</h3>
              <button
                className="edit-name-button"
                onClick={() => handleModal(col)}
              >
                {/* SVG for an ellipsis icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                  <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div
              className="col-body"
              onDragOver={handleTaskDragOver} // Allow tasks to be dropped into the column body
              onDrop={(e) => handleTaskDropIntoColumnBody(e, col.id)} // Handle drop into column body
            >
              <button
                onClick={e => addTask(e, col)}
                className="add-task-button"
              >
                + Aggiungi Task
              </button>
              {col.tasks.map((task) => (
                <div
                  key={task.id} // Use unique task ID as key
                  className="tasks-row"
                  draggable="true"
                  onDragStart={(e) => handleTaskDragStart(e, task.id, col.id)}
                  onDragOver={handleTaskDragOver}
                  onDrop={(e) => handleTaskDrop(e, task.id, col.id)}
                >
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
