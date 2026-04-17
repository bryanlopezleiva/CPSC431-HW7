const express = require("express");
const router = express.Router();
const List = require("../models/List");

// GET all lists
router.get("/", async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one list by id
router.get("/:id", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new list
router.post("/", async (req, res) => {
  try {
    const list = new List({ title: req.body.title });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD a new text entry to a list
router.post("/:id/entries", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    list.entries.push({ text: req.body.text });
    await list.save();

    res.status(200).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE an entry's text and/or status
router.put("/:id/entries/:entryId", async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const { status, text } = req.body;

    const list = await List.findById(id);
    if (!list) return res.status(404).json({ error: "List not found" });

    const entry = list.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (text !== undefined) {
      entry.text = text;
    }

    if (status !== undefined) {
      entry.status = status;
    }

    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE an entire list
router.delete("/:id", async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE one entry from a list
router.delete("/:id/entries/:entryId", async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    const entry = list.entries.id(req.params.entryId); // Entries are subdocuments of the lists
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    entry.deleteOne();

    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;