import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faEllipsis } from '@fortawesome/free-solid-svg-icons'

const AppModal = ({ isOpen, value, setModal, onConfirm }) => {
  if (!isOpen) return null
  console.log(value);

  const handleChange = (e) => {
    setModal(prev => ({ isOpen: prev.isOpen, value: { id: value.id, name: e.target.value, tasks: value.tasks } }))
    console.log('value', value);

  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <label htmlFor="name">Nome</label>
        <input type="text"
          value={value.name}
          onChange={handleChange} />
        <button onClick={() => setModal(prev => ({ isOpen: !prev.isOpen, value: prev.value }))}>
          Chiudi</button>
        <button onClick={onConfirm}>Conferma</button>
      </div>
    </div>
  )
}

function App() {
  const [column, setColumn] = useState([])
  const [modal, setModal] = useState({ isOpen: false, value: {} })

  const addColumn = () => {
    const newColumn = {
      id: Date.now(),
      name: 'New Column',
      tasks: [{ title: 'Task', desc: 'Descrizione' }]
    }
    setColumn(prev => [...prev, newColumn])
  }

  const addTask = (_, col) => {
    console.log(col);
    setColumn(prev => prev.map(c => {
      if (c.id === col.id) {
        return { ...c, tasks: [...c.tasks, { title: 'Task', desc: 'Descrizione' }] }
      }
      return c
    }))
  }

  const handleConfirm = () => {
    setColumn(prev => prev.map(col => {
      if (col.id === modal.value.id) {
        return { ...col, name: modal.value.name }
      }
      return col
    }))
    setModal(prev => ({ isOpen: !prev.isOpen, value: prev.value }))
  }

  const handleModal = (col) => {
    setModal(prev => ({
      isOpen: !prev.isOpen,
      value: col
    }))
  }

  return (
    <>
      <h1>Kanban</h1>
      <h2>Task</h2>
      <nav>
        <button onClick={addColumn}>
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </nav>
      <section className='kanban'>
        {column.map((col, index) =>
          <div key={index}>
            <div className='col-header'>
              <h3>{col.name}</h3>
              <button className='edit-name' onClick={() => handleModal(col)}>
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </div>
            <div className='col-body'>
              <button onClick={e => addTask(e, col)}>+</button>
              {col.tasks.map((task, index) => {
                return (
                  <div key={index} className='tasks-row'>
                    <h4>{task.title}</h4>
                    <p>{task.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section >
      <AppModal isOpen={modal.isOpen} value={modal.value} onConfirm={handleConfirm} setModal={setModal} setColumn={setColumn} />
    </>
  )
}

export default App
