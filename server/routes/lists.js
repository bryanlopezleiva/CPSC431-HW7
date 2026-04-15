const express = require("express");
const router = express.Router();
const List = require("../models/List");

/// lets start with the GET methods -- this will fetch all the lists
router.get("/", async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// this GET method will be specific via an id
router.get("/:id", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "Lists not found" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// lets shift over to some POST methods
router.post("/", async (req, res) => {
  try {
    const list = new List({ name: req.body.name });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/// the next post item will be to the following id or ongoing task
router.post("/:id/items", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });
    list.items.push({ text: req.body.text });
    await list.save();
    res.status(200).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/// PUT method to update a task complete
router.put("/:id/items/:itemId", async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { completed, text } = req.body;

    const list = await List.findById(id);
    if (!list) return res.status(404).json({ error: "List not found" });

    const item = list.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    console.log("BEFORE:", item.text);

    if (text !== undefined) {
      item.text = text;
    }

    if (completed !== undefined) {
      item.completed = completed;
    }

    await list.save();

    console.log("AFTER:", item.text);

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// DELETE methods -- this will delete an entire lists
router.delete("/:id", async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/// here we want to remove an item from a list
router.delete("/:id/items/:itemId", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    const item = await list.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.deleteOne();

    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
