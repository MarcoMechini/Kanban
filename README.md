# Kanban Board React

Una semplice Kanban Board realizzata in React, con drag & drop avanzato tramite la libreria [@hello-pangea/dnd](https://github.com/hello-pangea/dnd).

## Funzionalità
- Aggiungi colonne e task dinamicamente
- Modifica il nome delle colonne tramite modale
- Trascina colonne e task per riordinarli o spostarli tra colonne
- Persistenza dei Dati (in localStorage)

## Tecnologie usate
- React
- @hello-pangea/dnd (per il drag & drop)
- Vite (per lo sviluppo e build)

## Struttura principale
- `src/App.jsx`: logica e UI della board Kanban
- `src/index.css`: stili principali
- `public/`: risorse statiche

## Note drag & drop
- Il drag & drop è gestito tramite `<DragDropContext>`, `<Droppable>` e `<Draggable>`
- Puoi trascinare sia le colonne (orizzontalmente) che i task (verticalmente e tra colonne)

## Screenshot 
![Screenshot 2025-06-09 121739](https://github.com/user-attachments/assets/e120a15a-92ea-455b-aa08-f57261146938)
---