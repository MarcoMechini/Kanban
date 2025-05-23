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

  // Column Drag Handlers
  const handleColumnDragStart = (e, colId) => {
    draggedItem.current = { type: 'column', id: colId };
    e.dataTransfer.setData('columnId', colId);
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
  };

  const handleColumnDrop = (e, targetColId) => {
    e.preventDefault();
    const draggedColId = e.dataTransfer.getData('columnId');

    if (draggedColId === targetColId || !draggedColId) {
      return; // Dropped on itself or no column ID
    }

    setColumn(prevColumns => {
      const draggedIndex = prevColumns.findIndex(col => col.id === draggedColId);
      const targetIndex = prevColumns.findIndex(col => col.id === targetColId);

      if (draggedIndex === -1 || targetIndex === -1) return prevColumns;

      return reorder(prevColumns, draggedIndex, targetIndex);
    });
    draggedItem.current = null; // Clear dragged item ref
  };

  // Task Drag Handlers
  const handleTaskDragStart = (e, taskId, columnId) => {
    draggedItem.current = { type: 'task', id: taskId, sourceColumnId: columnId };
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', columnId);
  };

  const handleTaskDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleTaskDrop = (e, targetTaskId, targetColumnId) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (!draggedTaskId || !sourceColumnId) {
      return; // No task data
    }

    // Find the dragged task object
    let draggedTask = null;
    setColumn(prevColumns => {
      const newColumns = prevColumns.map(col => {
        if (col.id === sourceColumnId) {
          draggedTask = col.tasks.find(task => task.id === draggedTaskId);
          return { ...col, tasks: col.tasks.filter(task => task.id !== draggedTaskId) };
        }
        return col;
      });

      if (!draggedTask) return prevColumns; // Task not found

      return newColumns.map(col => {
        if (col.id === targetColumnId) {
          const targetTaskIndex = col.tasks.findIndex(task => task.id === targetTaskId);
          const newTasks = Array.from(col.tasks);
          // Insert the dragged task at the target position
          newTasks.splice(targetTaskIndex !== -1 ? targetTaskIndex : newTasks.length, 0, draggedTask);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
    draggedItem.current = null; // Clear dragged item ref
  };

  // Handle dropping a task into a column body (empty column or at the end)
  const handleTaskDropIntoColumnBody = (e, targetColumnId) => {
    e.preventDefault();
    const draggedTaskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (!draggedTaskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      return; // No task data or dropping into the same column (handled by task drop)
    }

    // Find the dragged task object
    let draggedTask = null;
    setColumn(prevColumns => {
      const newColumns = prevColumns.map(col => {
        if (col.id === sourceColumnId) {
          draggedTask = col.tasks.find(task => task.id === draggedTaskId);
          return { ...col, tasks: col.tasks.filter(task => task.id !== draggedTaskId) };
        }
        return col;
      });

      if (!draggedTask) return prevColumns; // Task not found

      return newColumns.map(col => {
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, draggedTask] };
        }
        return col;
      });
    });
    draggedItem.current = null; // Clear dragged item ref
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
            draggable="true"
            onDragStart={(e) => handleColumnDragStart(e, col.id)}
            onDragOver={handleColumnDragOver}
            onDrop={(e) => handleColumnDrop(e, col.id)}
          >
            <div className="col-header">
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
