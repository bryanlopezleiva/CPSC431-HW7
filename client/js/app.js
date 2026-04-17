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

      const titleSpan = document.createElement("span");
      titleSpan.textContent = list.title;
      titleSpan.className = "clickable-name";
      titleSpan.addEventListener("click", () => loadItems(list._id, list.title));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        await deleteList(list._id);
      });

      li.appendChild(titleSpan);
      li.appendChild(deleteBtn);
      listsEl.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading lists:", error);
  }
}

async function createList() {
  const title = newListNameEl.value.trim();

  if (!title) {
    alert("Please enter a list title.");
    return;
  }

  try {
    await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    newListNameEl.value = "";
    loadLists();
  } catch (error) {
    console.error("Error creating list:", error);
  }
}

async function loadItems(listId, fallbackTitle = "Selected List") {
  currentListId = listId;

  try {
    const response = await fetch(`${API_BASE}/${listId}`);
    const data = await response.json();

    const list = Array.isArray(data)
      ? data.find((item) => item._id === listId)
      : data;

    if (!list) {
      currentListNameEl.textContent = fallbackTitle;
      itemsEl.innerHTML = "<li>Could not load this list.</li>";
      return;
    }

    currentListNameEl.textContent = list.title;
    itemsEl.innerHTML = "";

    list.entries.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "item-row";

      const textSpan = document.createElement("span");
      textSpan.textContent = entry.text;
      textSpan.className = "item-text";

      if (entry.status) {
        textSpan.classList.add("completed");
      }

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = entry.status ? "Uncheck" : "Check";
      toggleBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        await toggleItem(entry._id, entry.status);
      });

      const statusSpan = document.createElement("span");
      statusSpan.textContent = entry.status ? "Completed" : "Not completed";
      statusSpan.className = "status-label";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async (event) => {
        event.stopPropagation();
        await deleteItem(entry._id);
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
    await fetch(`${API_BASE}/${currentListId}/entries`, {
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

async function toggleItem(entryId, currentStatusValue) {
  if (!currentListId) return;

  try {
    await fetch(`${API_BASE}/${currentListId}/entries/${entryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: !currentStatusValue })
    });

    loadItems(currentListId);
  } catch (error) {
    console.error("Error updating item:", error);
  }
}

async function deleteItem(entryId) {
  if (!currentListId) return;

  try {
    await fetch(`${API_BASE}/${currentListId}/entries/${entryId}`, {
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