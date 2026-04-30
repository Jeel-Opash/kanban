import { create } from "zustand";
import api from "../api/api";

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => String(a.order || "").localeCompare(String(b.order || "")) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));

const normalizeBoard = (board) => ({
  ...board,
  columns: sortByOrder(board.columns || []).map((column) => ({
    ...column,
    cards: sortByOrder(column.cards || column.cardIds || [])
  })),
  workspaceMembers: board.workspaceMembers || []
});

const updateCardInColumns = (columns, card) =>
  columns.map((column) => {
    const without = column.cards.filter((item) => item._id !== card._id);
    if (column._id !== String(card.column)) return { ...column, cards: without };
    return { ...column, cards: sortByOrder([...without, card]) };
  });

const moveCardLocal = (columns, cardId, targetColumnId, targetIndex) => {
  let movedCard;
  const without = columns.map((column) => {
    const cards = column.cards.filter((card) => {
      if (card._id === cardId) {
        movedCard = card;
        return false;
      }
      return true;
    });
    return { ...column, cards };
  });
  if (!movedCard) return columns;
  return without.map((column) => {
    if (column._id !== targetColumnId) return column;
    const cards = [...column.cards];
    cards.splice(Math.min(targetIndex, cards.length), 0, { ...movedCard, column: targetColumnId });
    return { ...column, cards };
  });
};

const useBoardStore = create((set, get) => ({
  board: null,role: "Viewer",loading: false,error: "",pending: {},
  presence: [],cursors: {},socketStatus: "disconnected",

  canEdit: () => ["Owner", "Editor"].includes(get().role),

  loadBoard: async (boardId) => {
    set({ loading: true, error: "" });
    try {
      const res = await api.get(`/board/single/${boardId}`);
      const board = normalizeBoard(res.data);
      set({ board, role: board.role || "Viewer", loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || "Board failed to load", loading: false });
    }
  },

  addColumn: async (title) => {
    const { board } = get();
    if (!board) return;
    try {
      const res = await api.post("/column", { title, boardId: board._id });
      set({ board: { ...board, columns: sortByOrder([...board.columns, { ...res.data.column, cards: [] }]) } });
    } catch (error) {
      set({ error: error.response?.data?.message || "Column not created" });
    }
  },

  addCard: async (columnId, title) => {
    try {
      const res = await api.post("/card", { columnId, title, description: "" });
      get().applyCard(res.data.card);
    } catch (error) {
      set({ error: error.response?.data?.message || "Card not created" });
    }
  },

  updateCard: async (cardId, updates) => {
    const previous = get().board;
    const card = previous?.columns.flatMap((column) => column.cards).find((item) => item._id === cardId);
    if (!card) return;
    const optimistic = { ...card, ...updates };
    set({ board: { ...previous, columns: updateCardInColumns(previous.columns, optimistic) } });
    try {
      const payload = { ...updates, version: card.version };
      if (Array.isArray(payload.assignees)) {
        payload.assignees = payload.assignees.map((a) => a._id || a);
      }
      const res = await api.patch(`/card/${cardId}`, payload);
      get().applyCard(res.data.card);
    } catch (error) {
      set({ board: previous, error: error.response?.data?.message || "Card not updated" });
      if (error.response?.data?.card) get().applyCard(error.response.data.card);
    }
  },

  moveCard: async (cardId, targetColumnId, targetIndex) => {
    const previous = get().board;
    const card = previous?.columns.flatMap((column) => column.cards).find((item) => item._id === cardId);
    if (!card) return;
    set({
      board: { ...previous, columns: moveCardLocal(previous.columns, cardId, targetColumnId, targetIndex) },
      pending: { ...get().pending, [cardId]: previous }
    });
    try {
      const res = await api.patch(`/card/${cardId}/move`, { targetColumnId, targetIndex, version: card.version });
      get().applyCard(res.data.card);
    } catch (error) {
      set({
        board: previous,
        error: error.response?.data?.message || "Move rejected",
        pending: { ...get().pending, [cardId]: undefined }
      });
      if (error.response?.data?.card) get().applyCard(error.response.data.card);
    }
  },

  applyCard: (card) => {
    const { board } = get();
    if (!board) return;
    set({ board: { ...board, columns: updateCardInColumns(board.columns, card) } });
  },

  removeCard: (cardId) => {
    const { board } = get();
    if (!board) return;
    set({
      board: {
        ...board,
        columns: board.columns.map((column) => ({ ...column, cards: column.cards.filter((card) => card._id !== cardId) }))
      }
    });
  },

  setPresence: (presence) => set({ presence }),
  setSocketStatus: (socketStatus) => set({ socketStatus }),
  setCursor: (cursor) => set({ cursors: { ...get().cursors, [cursor.user.id]: cursor } }),
  clearError: () => set({ error: "" })
}));

export default useBoardStore;
