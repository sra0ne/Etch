import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import EtchABI from "../contracts/Etch.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x"; //change with your contract address

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

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

  async function fetchNotes(currentProvider) {
    if (!currentProvider) return;
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EtchABI,
      currentProvider
    );
    const result = await contract.getMyNotes();
    setNotes(result);
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
                <span className="wallet-address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
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

              <button
                onClick={addNote}
                className="save-button"
                disabled={!account}
              >
                {!account ? "Connect Wallet" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
