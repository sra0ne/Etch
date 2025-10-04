import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import EtchABI from "../contracts/Etch.json";
import "./App.css";
import dayjs from "dayjs";

const CONTRACT_ADDRESS = "0xea831e5cf42946690a654a6d7c1e0857dfa06881"; //change with your contract address

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [searchKey, setSearchKey] = useState("");

  async function connectWallet() {
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      const connection = await web3Modal.connect();
      const ethersProvider = new ethers.BrowserProvider(connection);
      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();

      setAccount(addr);
      setProvider(ethersProvider);
      fetchNotes(ethersProvider);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }

  function disconnectWallet() {
    try {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      web3Modal.clearCachedProvider();
      setAccount(null);
      setProvider(null);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  }

  async function fetchNotes(currentProvider) {
    if (!currentProvider) {
      console.warn("No provider available");
      return;
    }
    try {
      const signer = await currentProvider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, EtchABI, signer);
      const result = await contract.getMyNotes();

      const formatted = result.map((note) => ({
        title: note.title ?? note[0],
        content: note.content ?? note[1],
        timestamp: note.timestamp ?? note[2],
      }));
      setNotes(formatted);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }

  async function addNote() {
    if (!title || !content) return alert("Title and content required!");
    if (!provider) return alert("Connect wallet first");

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, EtchABI, signer);
    const tx = await contract.addNote(title, content);
    await tx.wait();
    setTitle("");
    setContent("");
    fetchNotes(provider);
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchKey.toLowerCase()) ||
      note.content.toLowerCase().includes(searchKey.toLowerCase())
  );
  console.log(filteredNotes);

  useEffect(() => {
    if (provider) {
      fetchNotes(provider);
    } else {
      setNotes([]);
    }
  }, [provider]);

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="app-header">
          <h1 className="app-title">Etch</h1>

          <div className="wallet-section">
            {!account ? (
              <button onClick={connectWallet} className="connect-button">
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <button className="connect-button" onClick={disconnectWallet}>
                  {account.slice(0, 6)}...{account.slice(-4)}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="app-subtitle">Immutable notes on the blockchain</p>

        <div className="app-grid">
          <div className="note-editor">
            <div className="editor-content">
              <div className="input-group">
                <label htmlFor="title" className="input-label">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-input"
                />
              </div>

              <div className="input-group">
                <label htmlFor="content" className="input-label">
                  Content
                </label>
                <textarea
                  id="content"
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="textarea-input"
                />
              </div>
              <div className="button-group">
                <button
                  onClick={addNote}
                  className="save-button"
                  disabled={!account}
                >
                  {!account ? "Connect Wallet" : "Save"}
                </button>
                <button
                  onClick={() => fetchNotes(provider)}
                  className="refresh-button"
                  disabled={!provider}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="notes-list">
            <div className="notes-header-row">
              <h2 className="saved-notes">Saved Notes ({notes.length})</h2>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            {notes.length === 0 ? (
              <div className="empty-notes">
                <div className="empty-content">
                  <div className="empty-icon">📄</div>
                  <p className="empty-text">
                    No notes yet. Create your first note!
                  </p>
                </div>
              </div>
            ) : (
              <div className="notes-list">
                {filteredNotes.map((note, idx) => (
                  <div key={idx} className="note-card">
                    <div className="note-content">
                      <div className="note-header">
                        <h3 className="note-title">{note.title}</h3>
                      </div>

                      <p className="note-text">
                        {note.content || "No content"}
                      </p>
                      <p className="note-date">
                        {dayjs
                          .unix(Number(note.timestamp))
                          .format("DD/MM/YYYY, hh:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
