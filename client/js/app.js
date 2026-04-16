const API_BASE = "/api/lists";
let currentListId = null;

const listsEl = document.getElementById("lists");
const itemsEl = document.getElementById("items");
const currentListNameEl = document.getElementById("currentListName");
const newListNameEl = document.getElementById("newListName");
const newItemTextEl = document.getElementById("newItemText");
const addListBtn = document.getElementById("addListBtn");
const addItemBtn = document.getElementById("addItemBtn");

addListBtn.addEventListener("click", createList);
addItemBtn.addEventListener("click", addItem);

async function loadLists() {
  try {
    const response = await fetch(API_BASE);
    const lists = await response.json();

    listsEl.innerHTML = "";

    lists.forEach((list) => {
      const li = document.createElement("li");
      li.className = "list-item";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = list.name;
      nameSpan.className = "clickable-name";
      nameSpan.addEventListener("click", () => loadItems(list._id, list.name));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        await deleteList(list._id);
      });

      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      listsEl.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading lists:", error);
  }
}

async function createList() {
  const name = newListNameEl.value.trim();

  if (!name) {
    alert("Please enter a list name.");
    return;
  }

  try {
    await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    newListNameEl.value = "";
    loadLists();
  } catch (error) {
    console.error("Error creating list:", error);
  }
}

async function loadItems(listId, fallbackName = "Selected List") {
  currentListId = listId;

  try {
    const response = await fetch(`${API_BASE}/${listId}`);
    const data = await response.json();

    // If backend GET /:id is still broken, this helps avoid crashing.
    const list = Array.isArray(data)
      ? data.find((item) => item._id === listId)
      : data;

    if (!list) {
      currentListNameEl.textContent = fallbackName;
      itemsEl.innerHTML = "<li>Could not load this list.</li>";
      return;
    }

    currentListNameEl.textContent = list.name;
    itemsEl.innerHTML = "";

    list.items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "item-row";

      const textSpan = document.createElement("span");
      textSpan.textContent = item.text;
      textSpan.className = "item-text";
      if (item.completed) {
        textSpan.classList.add("completed");
      }

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = item.completed ? "Uncheck" : "Check";
      toggleBtn.addEventListener("click", async () => {
        await toggleItem(item._id, item.completed);
      });

      const statusSpan = document.createElement("span");
      statusSpan.textContent = item.completed ? "Completed" : "Not completed";
      statusSpan.className = "status-label";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async () => {
        await deleteItem(item._id);
      });

      li.appendChild(textSpan);
      li.appendChild(statusSpan);
      li.appendChild(toggleBtn);
      li.appendChild(deleteBtn);
      itemsEl.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading items:", error);
  }
}

async function addItem() {
  const text = newItemTextEl.value.trim();

  if (!currentListId) {
    alert("Please select a list first.");
    return;
  }

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  try {
    await fetch(`${API_BASE}/${currentListId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    newItemTextEl.value = "";
    loadItems(currentListId);
  } catch (error) {
    console.error("Error adding item:", error);
  }
}

async function toggleItem(itemId, currentCompletedValue) {
  if (!currentListId) return;

  try {
    await fetch(`${API_BASE}/${currentListId}/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ completed: !currentCompletedValue })
    });

    loadItems(currentListId);
  } catch (error) {
    console.error("Error updating item:", error);
  }
}

async function deleteItem(itemId) {
  if (!currentListId) return;

  try {
    await fetch(`${API_BASE}/${currentListId}/items/${itemId}`, {
      method: "DELETE"
    });

    loadItems(currentListId);
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

async function deleteList(listId) {
  try {
    await fetch(`${API_BASE}/${listId}`, {
      method: "DELETE"
    });

    if (currentListId === listId) {
      currentListId = null;
      currentListNameEl.textContent = "Select a list";
      itemsEl.innerHTML = "";
    }

    loadLists();
  } catch (error) {
    console.error("Error deleting list:", error);
  }
}

loadLists();