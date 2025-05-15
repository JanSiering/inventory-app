// Live-Web-App mit Google Sheets-Anbindung + QR-Code Scan + Formular-Write
import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  const API_BASE = "https://script.google.com/macros/s/AKfycbxHT_QN-RIvL3QRHamBZjgO3XCDeAmXJwGGtZV20ZV04kXAU2pPEjIpvP59HPik3zLJ/exec";

  useEffect(() => {
    fetch(`${API_BASE}?action=getInventory\`)
      .then(res => {
        if (!res.ok) throw new Error("Fehler beim Laden der Daten");
        return res.json();
      })
      .then(data => {
        setInventory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Inventardaten konnten nicht geladen werden.");
        setLoading(false);
      });
  }, []);

  const startScanner = () => {
    if (scannerActive) return;
    setScannerActive(true);
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );
    scanner.render(
      (decodedText) => {
        setSearchTerm(decodedText);
        scanner.clear();
        setScannerActive(false);
      },
      (error) => {
        console.warn(error);
      }
    );
  };

  const handleAction = async (type, itemId, name, email, menge, kommentar) => {
    const res = await fetch(`${API_BASE}?action=addTransaction\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Item ID": itemId,
        "Name": name,
        "Email": email,
        "Anzahl": menge,
        "Typ": type,
        "Kommentar": kommentar
      })
    });
    const result = await res.text();
    alert(result);
  };

  const filteredItems = inventory.filter(item =>
    item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item["Item ID"]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Marketing Inventar</h1>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Artikel suchen oder ID scannen"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <button onClick={startScanner} className="bg-blue-500 text-white px-4 py-2 rounded">QR-Scan</button>
      </div>

      <div id="qr-reader" className="mb-4" ref={scannerRef}></div>

      {loading && <p>⏳ Lädt Inventar...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredItems.map(item => (
          <div key={item["Item ID"]} className="border rounded p-4">
            <img src={item["Bild URL"] || "https://via.placeholder.com/150"} alt={item.Name} className="mb-2 w-full h-32 object-cover" />
            <h2 className="font-semibold text-lg">{item.Name}</h2>
            <p className="text-sm text-gray-500">{item.Lagerort}</p>
            <p className="text-sm">Verfügbar: {item.Verfügbar}</p>
            <div className="mt-2 space-y-2">
              <input placeholder="E-Mail" className="border p-1 w-full" id={`email-${item["Item ID"]}`} />
              <input placeholder="Menge" type="number" className="border p-1 w-full" id={`menge-${item["Item ID"]}`} />
              <input placeholder="Kommentar (optional)" className="border p-1 w-full" id={`kommentar-${item["Item ID"]}`} />
              <div className="flex gap-2 mt-2">
                {["ausgeliehen", "zurückgegeben", "verbraucht"].map(typ => (
                  <button
                    key={typ}
                    className="flex-1 border px-2 py-1 rounded text-sm"
                    onClick={() => handleAction(typ, item["Item ID"], item.Name,
                      document.getElementById(`email-${item["Item ID"]}`).value,
                      document.getElementById(`menge-${item["Item ID"]}`).value,
                      document.getElementById(`kommentar-${item["Item ID"]}`).value
                    )}
                  >
                    {typ}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
