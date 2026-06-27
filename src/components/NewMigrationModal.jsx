// import { useEffect,useState } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import "../MigrateDB.css";

// export default function NewMigrationModal({ isOpen, onClose, onCreate }) {
//   const [name, setName] = useState("");
//   const [version, setVersion] = useState(null);
//   const [upScript, setUpScript] = useState("");
//   const [downScript, setDownScript] = useState("");
//   const [previewResult, setPreviewResult] = useState("");

//   const [show, setShow] = useState(false);

// useEffect(() => {
//   if (isOpen) {
//     setTimeout(() => setShow(true), 10); // trigger animation
//   } else {
//     setShow(false);
//   }
// }, [isOpen]);

// if (!isOpen && !show) return null;

//   // 🔢 Auto Versioning (simulate backend call)
//   const fetchNextVersion = async () => {
//     const res = await axios.get("/api/migrations/next-version");
//     setVersion(res.data); // e.g., V3
//   };

//   // 🧪 SQL Validation (basic client-side)
//   const validateSQL = (sql) => {
//     if (!sql.trim()) return "SQL cannot be empty";
//     if (!sql.endsWith(";")) return "SQL should end with semicolon";
//     return null;
//   };

//   // 🔍 Dry Run API
//   const handlePreview = async () => {
//     const error = validateSQL(upScript);
//     if (error) {
//       alert(error);
//       return;
//     }

//     try {
//       const res = await axios.post("/api/migrations/preview", {
//         sql: upScript,
//       });
//       setPreviewResult(JSON.stringify(res.data, null, 2));
//     } catch (e) {
//       setPreviewResult("Error: " + e.message);
//     }
//   };

//   const handleSubmit = async () => {
//     const error = validateSQL(upScript);
//     if (error) {
//       alert(error);
//       return;
//     }

//     const finalName = `${version || "V?"}__${name}.sql`;

//     await onCreate({
//       name: finalName,
//       upScript,
//       downScript,
//     });

//     onClose();
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">

//         <h2>New Migration</h2>

//         <button className="button btn-secondary" onClick={fetchNextVersion}>
//           Generate Version
//         </button>

//         <input
//           className="input"
//           placeholder="Migration Name (init_schema)"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         {version && (
//           <p>Generated: {version}__{name}.sql</p>
//         )}

//         <h4>Up Migration</h4>
//         <Editor
//           height="200px"
//           defaultLanguage="sql"
//           theme="vs-dark"
//           value={upScript}
//           onChange={(v) => setUpScript(v)}
//         />

//         <h4>Down Migration</h4>
//         <Editor
//           height="150px"
//           defaultLanguage="sql"
//           theme="vs-dark"
//           value={downScript}
//           onChange={(v) => setDownScript(v)}
//         />

//         <div style={{ marginTop: "10px" }}>
//           <button className="button btn-preview" onClick={handlePreview}>
//             Preview / Dry Run
//           </button>
//         </div>

//         {previewResult && (
//           <pre style={{ background: "#0d1117", padding: "10px", marginTop: "10px" }}>
//             {previewResult}
//           </pre>
//         )}

//         <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
//           <button className="button btn-secondary" onClick={onClose}>
//             Cancel
//           </button>

//           <button className="button btn-primary" onClick={handleSubmit}>
//             Create Migration
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }