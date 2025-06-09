import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AppModal from './components/AppModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';


function App() {

  const [column, setColumn] = useState([]);
  const [options, setOptions] = useState({ id: 0, flag: true });
  const [modal, setModal] = useState({ isOpen: false, value: {} });

  const lastColumnRef = useRef(null)

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
      tasks: [{ id: Date.now().toString() + 1, colId: Date.now().toString(), title: 'Nuovo Task', desc: 'Descrizione del Task' }] // Unique ID for task
    };
    setColumn(prev => [...prev, newColumn]);
  };

  useEffect(() => {
    if (lastColumnRef.current) lastColumnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [column]);

  const addTask = (_, col) => {
    setColumn(prev => prev.map(c => {
      if (c.id === col.id) {
        return { ...c, tasks: [{ colId: c.id, id: Date.now().toString(), title: 'Nuovo Task', desc: 'Descrizione del Task' }, ...c.tasks] };
      }
      return c;
    }));
  };

  const handleConfirm = () => {
    if (!modal.value.desc) {
      setColumn(prev => prev.map(col => {
        if (col.id === modal.value.id) {
          return { ...col, name: modal.value.name };
        }
        return col;
      }));
    }
    if (modal.value.desc) {
      setColumn(prev => prev.map(col => {
        if (col.id === modal.value.colId) {
          return {
            ...col, tasks: col.tasks.map(task => {
              if (task.id === modal.value.id) {

                return { ...task, title: modal.value.name, desc: modal.value.desc }
              }
              return task;
            })
          }

        }
        return col;
      }));
    }

    setModal(prev => ({ isOpen: false, value: prev.value }));
  };

  const handleModal = (curValue, isCol = false) => {
    if (isCol) {
      setModal({
        isOpen: true,
        value: curValue
      });
      return;
    }
    if (!isCol) {
      setModal({
        isOpen: true,
        value: {
          id: curValue.id,
          name: curValue.title,
          colId: curValue.colId,
          desc: curValue.desc
        }
      })
      return;
    }

  };

  const handleDeleteColumn = columnToDelete => {
    setColumn(prev => prev.filter(col => col.id !== columnToDelete.id))
  }

  const handleDeleteTask = taskToDelete => {
    setColumn(prev => prev.map(col => {
      if (col.id === taskToDelete.colId) {
        return {
          ...col, tasks: col.tasks.filter(task => {
            if (task.id !== taskToDelete.id) {
              return task;
            }
            return;
          })
        }
      }
      return col;
    }));
  }

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
      <section className='hero'>
        <h1 className="main-title">Kanban Board</h1>
        <h2 className="subtitle">Organizza i tuoi Task</h2>
        <nav>
          <button onClick={addColumn} className="add-column-button">
            {/* SVG per icona */}
            <FontAwesomeIcon icon={faPen} />
            {/* <FontAwesomeIcon icon={faHome} /> */}
            Aggiungi Colonna
          </button>
        </nav>
      </section>
      <DragDropContext onDragEnd={onDragEnd}> {/* Inizio del contesto Drag & Drop globale */}
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided, snapshot) => (
            <section className="kanban" ref={provided.innerRef} {...provided.droppableProps}
            // style={{ backgroundColor: snapshot.isDragging ? 'red' : 'transparent' }}
            >
              {column.map((col, colIdx) => (
                <Draggable key={col.id} draggableId={col.id} index={colIdx}>
                  {(provided, snapshot) => (
                    <div
                      className="column-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="col-header"
                        tabIndex={0}
                        ref={(column[column.length - 1] === col) ? lastColumnRef : null}
                        {...provided.dragHandleProps}>
                        <h3>{col.name}</h3>
                        <button
                          style={{ 'display': (options.id === col.id && options.flag === true) ? 'none' : '' }}
                          className="edit-name-button"
                          onClick={() => {
                            if (options.id !== col.id) {
                              setOptions({ id: col.id, flag: options.flag })
                            }
                            else if (options.id === col.id) {
                              setOptions({ id: col.id, flag: !options.flag })
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                            <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {(options.id === col.id && options.flag) &&
                          <div className='options'>
                            <button className='icon-btn' onClick={() => handleModal(col, true)}>
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button className='icon-btn' onClick={() => handleDeleteColumn(col)}>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        }
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
                                    <div className='task-value'>
                                      <h4>{task.title}</h4>
                                      <p>{task.desc}</p>
                                    </div>
                                    <div className='task-settings'>
                                      <button
                                        style={{ 'display': (options.id === task.id && options.flag === true) ? 'none' : '' }}
                                        className="edit-name-button"
                                        onClick={() => {
                                          if (options.id !== task.id) {
                                            setOptions({ id: task.id, flag: options.flag })
                                          }
                                          else if (options.id === task.id) {
                                            setOptions({ id: task.id, flag: !options.flag })
                                          }
                                        }}
                                      >
                                        {/* SVG per ellipsis */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                                          <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
                                        </svg>
                                      </button>
                                      {(options.id === task.id && options.flag) &&
                                        <div className='options'>
                                          <button className='icon-btn' onClick={() => handleModal(task)}>
                                            <FontAwesomeIcon icon={faPen} />
                                          </button>
                                          <button className='icon-btn' onClick={() => handleDeleteTask(task)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                          </button>
                                        </div>
                                      }
                                    </div>
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
    </div >
  );
}

export default App;
