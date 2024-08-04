// cardService.js

const db = require('./db'); // Assuming you have a db module for database connection

// Function to create a card
function createCard(cardData) {
  const { order, boardId, swimlaneId, name, content, dueDate, complete } = cardData;
  const query = 'INSERT INTO cards (order, board_id, swimlane_id, name, content, due_dat, completee) VALUES (?, ?, ?, ?, ?, ?,?)';
  return db.query(query, [order, boardId, swimlaneId, name, content, dueDate, complete]);
}

// Function to update a card
function updateCard(cardId, cardData) {
  const { order, boardId, swimlaneId, name, content, dueDate, complete } = cardData;
  const query = 'UPDATE cards SET order = ?, board_id = ?, swimlane_id = ?, name = ?, content = ?, due_date = ?, complete = ? WHERE id = ?';
  return db.query(query, [order, boardId, swimlaneId, name, content, dueDate, complete,cardId]);
}

module.exports = {
  createCard,
  updateCard,
};