import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Link, useParams } from "react-router-dom";
import "./board.css";

const defaultColumns = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "card-1", title: "Create login page", description: "JWT login UI" },
      { id: "card-2", title: "Create register page", description: "New user form" }
    ]
  },
  {
    id: "progress",
    title: "In Progress",
    cards: [{ id: "card-3", title: "Dashboard page", description: "Workspace and boards" }]
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "card-4", title: "Frontend routes", description: "Login, register, dashboard" }]
  }
];

const Board = () => {
  const { boardId } = useParams();
  const [columns, setColumns] = useState(defaultColumns);
  const [columnTitle, setColumnTitle] = useState("");
  const [cardTitle, setCardTitle] = useState({});

  const addColumn = (event) => {
    event.preventDefault();
    if (!columnTitle.trim()) return;
    setColumns([...columns, { id: crypto.randomUUID(), title: columnTitle, cards: [] }]);
    setColumnTitle("");
  };

  const addCard = (event, columnId) => {
    event.preventDefault();
    const title = cardTitle[columnId]?.trim();
    if (!title) return;
    setColumns(columns.map((column) =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, { id: crypto.randomUUID(), title, description: "New card" }] }
        : column
    ));
    setCardTitle({ ...cardTitle, [columnId]: "" });
  };

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const nextColumns = [...columns];
    const fromColumn = nextColumns.find((column) => column.id === source.droppableId);
    const toColumn = nextColumns.find((column) => column.id === destination.droppableId);
    const [movedCard] = fromColumn.cards.splice(source.index, 1);
    toColumn.cards.splice(destination.index, 0, movedCard);
    setColumns(nextColumns);
  };

  return (
    <main className="board-page">
      <header className="board-header">
        <div>
          <Link className="board-back-link" to="/">Back to Dashboard</Link>
          <h1>Board Page</h1>
          <p>Frontend only board: {boardId}</p>
        </div>
      </header>

      <form className="board-column-form" onSubmit={addColumn}>
        <input value={columnTitle} placeholder="New column title" onChange={(event) => setColumnTitle(event.target.value)} />
        <button type="submit">Add Column</button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <section className="board-columns">
          {columns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(dropProvided) => (
               <article className="board-column" ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                <div className="board-column-header">
                  <h2>{column.title}</h2>
                <span>{column.cards.length}</span>
              </div>
              <div className="board-card-list">
              {column.cards.map((card, index) => (
                <Draggable draggableId={card.id} index={index} key={card.id}>
                  {(dragProvided) => (
                    <div
                    className="task-card"
                      ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
              </div>

                 <form className="board-card-form" onSubmit={(event) => addCard(event, column.id)}>
                  <input value={cardTitle[column.id] || ""} placeholder="New card title"
                    onChange={(event) => setCardTitle({ ...cardTitle, [column.id]: event.target.value })}/>
                  <button type="submit">Add Card</button>
              </form>
              </article>
            )}
          </Droppable>
        ))}
      </section>
    </DragDropContext>
    </main>
  );
};

export default Board;
