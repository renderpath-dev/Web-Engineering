"use client";

import { useState } from "react";

const storageKey = "next-boundary-lab-note";

export function ClientStoragePanel() {
  const [draft, setDraft] = useState("");
  const [storedValue, setStoredValue] = useState("Not loaded");
  const [status, setStatus] = useState("No browser storage action yet");

  function saveValue() {
    try {
      window.localStorage.setItem(storageKey, draft);
      setStoredValue(draft);
      setStatus("Saved in localStorage");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown storage error";
      setStatus(`Storage unavailable: ${message}`);
    }
  }

  function loadValue() {
    try {
      const value = window.localStorage.getItem(storageKey) ?? "";
      setDraft(value);
      setStoredValue(value || "No value stored");
      setStatus("Loaded from localStorage");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown storage error";
      setStatus(`Storage unavailable: ${message}`);
    }
  }

  return (
    <section>
      <h2>Browser-only storage</h2>
      <label htmlFor="boundary-note">Local note</label>
      <input
        id="boundary-note"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button type="button" onClick={saveValue}>
        Save
      </button>
      <button type="button" onClick={loadValue}>
        Load
      </button>
      <p>
        Stored value: <code>{storedValue}</code>
      </p>
      <p>{status}</p>
    </section>
  );
}
