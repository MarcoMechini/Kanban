import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faEllipsis } from '@fortawesome/free-solid-svg-icons'

const AppModal = ({ isOpen, setColumn }) => {
  if (!isOpen) return null
  // console.log(value);
  console.log('dentol il moda');


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* <input type="text" value={value.name} onChange={setColumn(prev => prev.find(curCol.value.id === col))} />
        {value.tasks.map((task, index) => (
          <div key={index} className="task">
            <input type="text" value={task.name} />
            <button className='delete-task'>
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          </div>
        ))} */}
      </div>
    </div>
  )
}

function App() {
  const [column, setColumn] = useState([])
  const [modal, setModal] = useState(false)

  const addColumn = () => {
    const newColumn = {
      id: Date.now(),
      name: 'New Column',
      tasks: []
    }
    setColumn(prev => [...prev, newColumn])
    console.log(column);
  }

  const handleModal = () => {
    console.log('sono qui');

    setModal(prev => (!prev))
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
              <button className='edit-name' onClick={handleModal}>
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </div>
          </div>
        )}
      </section>
      <AppModal isOpen={modal} setColumn={setColumn} />
    </>
  )
}

export default App
