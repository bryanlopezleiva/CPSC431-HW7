const express = require("express");
const mongoose = require("mongoose");
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid list id" });
    }

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
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const list = new List({ title });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD a new text entry to a list
router.post("/:id/entries", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid list id" });
    }

    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });

    list.entries.push({ text });
    await list.save();

    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE an entry's text and/or status
router.put("/:id/entries/:entryId", async (req, res) => {
  try {
    const { id, entryId } = req.params;
    const { status, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid list id" });
    }

    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ error: "Invalid entry id" });
    }

    const list = await List.findById(id);
    if (!list) return res.status(404).json({ error: "List not found" });

    const entry = list.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    if (text !== undefined) {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return res.status(400).json({ error: "Text cannot be empty" });
      }
      entry.text = trimmedText;
    }

    if (status !== undefined) {
      if (typeof status !== "boolean") {
        return res.status(400).json({ error: "Status must be true or false" });
      }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid list id" });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid list id" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.entryId)) {
      return res.status(400).json({ error: "Invalid entry id" });
    }

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
