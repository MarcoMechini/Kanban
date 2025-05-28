import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

  // Funzione per gestire il drag & drop con la libreria
  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Spostamento colonne
    if (type === 'COLUMN') {
      setColumn(prev => reorder(prev, source.index, destination.index));
      return;
    }

    // Spostamento task
    if (type === 'TASK') {
      if (source.droppableId === destination.droppableId) {
        // Spostamento task nella stessa colonna
        setColumn(prev => prev.map(col => {
          if (col.id !== source.droppableId) return col;
          return {
            ...col,
            tasks: reorder(col.tasks, source.index, destination.index)
          };
        }));
      } else {
        // Spostamento task tra colonne diverse
        setColumn(prev => {
          const sourceCol = prev.find(col => col.id === source.droppableId);
          const destCol = prev.find(col => col.id === destination.droppableId);
          if (!sourceCol || !destCol) return prev;
          const task = sourceCol.tasks[source.index];
          const newSourceTasks = Array.from(sourceCol.tasks);
          newSourceTasks.splice(source.index, 1);
          const newDestTasks = Array.from(destCol.tasks);
          newDestTasks.splice(destination.index, 0, task);
          return prev.map(col => {
            if (col.id === sourceCol.id) return { ...col, tasks: newSourceTasks };
            if (col.id === destCol.id) return { ...col, tasks: newDestTasks };
            return col;
          });
        });
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Kanban Board</h1>
      <h2 className="subtitle">Organizza i tuoi Task</h2>
      <nav>
        <button onClick={addColumn} className="add-column-button">
          {/* SVG per icona */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-14.561 14.56a2.625 2.625 0 0 0 0 3.712l3.713 3.713a2.625 2.625 0 0 0 3.712 0l14.56-14.561a2.625 2.625 0 0 0 0-3.712l-3.713-3.713Zm-10.318 7.375l-2.121 2.121a1.5 1.5 0 0 1-2.121 0l-.375-.375a1.5 1.5 0 0 1 0-2.121l2.121-2.121a1.5 1.5 0 0 1 2.121 0l.375.375a1.5 1.5 0 0 1 0 2.121Z" />
          </svg>
          Aggiungi Colonna
        </button>
      </nav>
      <DragDropContext onDragEnd={onDragEnd}> {/* Inizio del contesto Drag & Drop globale */}
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided, snapshot) => (
            <section className="kanban" ref={provided.innerRef} {...provided.droppableProps}>
              {column.map((col, colIdx) => (
                <Draggable key={col.id} draggableId={col.id} index={colIdx}>
                  {(provided, snapshot) => (
                    <div
                      className="column-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="col-header" {...provided.dragHandleProps}>
                        <h3>{col.name}</h3>
                        <button className="edit-name-button" onClick={() => handleModal(col)}>
                          {/* SVG per ellipsis */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                            <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <Droppable droppableId={col.id} type="TASK">
                        {(provided, snapshot) => (
                          <div
                            className="col-body"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <button onClick={e => addTask(e, col)} className="add-task-button">
                              + Aggiungi Task
                            </button>
                            {col.tasks.map((task, taskIdx) => (
                              <Draggable key={task.id} draggableId={task.id} index={taskIdx}>
                                {(provided, snapshot) => (
                                  <div
                                    className="tasks-row"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <h4>{task.title}</h4>
                                    <p>{task.desc}</p>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </section>
          )}
        </Droppable>
      </DragDropContext> {/* Fine DragDropContext */}
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
