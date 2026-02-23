import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [clientes, setClientes] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [montoBruto, setMontoBruto] = useState("");

  const cargarClientes = () => {
    fetch("http://localhost:8080/api/clientes")
      .then((res) => res.json())
      .then((datos) => setClientes(datos))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const guardarCliente = async () => {
    const res = await fetch("http://localhost:8080/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rucDni: documento, email: correo }),
    });
    if (res.ok) {
      alert("¡Cliente guardado!");
      setDocumento("");
      setCorreo("");
      cargarClientes();
    } else {
      alert("Error al guardar cliente.");
    }
  };

  const emitirRecibo = async () => {
    const reciboReq = {
      clienteId: parseInt(clienteId),
      servicioId: parseInt(servicioId),
      montoBruto: parseFloat(montoBruto),
    };

    const resPost = await fetch("http://localhost:8080/api/recibos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reciboReq),
    });

    if (!resPost.ok) {
      alert("Error al emitir el recibo. Revisa que los IDs existan.");
      return;
    }

    const reciboGenerado = await resPost.json();

    const resPdf = await fetch(
      `http://localhost:8080/api/recibos/${reciboGenerado.id}/pdf`,
    );

    if (resPdf.ok) {
      const blob = await resPdf.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Recibo_Honorarios_${reciboGenerado.id}.pdf`; // Nombre del archivo
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setClienteId("");
      setServicioId("");
      setMontoBruto("");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Sistema de Facturación 🚀</h1>

      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>1. Nuevo Cliente</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="DNI o RUC"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <button onClick={guardarCliente}>Guardar Cliente</button>
        </div>
      </div>

      <table
        border="1"
        style={{
          width: "100%",
          textAlign: "left",
          borderCollapse: "collapse",
          marginBottom: "40px",
        }}
      >
        <thead style={{ backgroundColor: "#333", color: "white" }}>
          <tr>
            <th style={{ padding: "8px" }}>ID Cliente</th>
            <th style={{ padding: "8px" }}>Documento</th>
            <th style={{ padding: "8px" }}>Razón Social</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td style={{ padding: "8px" }}>{cliente.id}</td>
              <td style={{ padding: "8px" }}>{cliente.rucDNI}</td>
              <td style={{ padding: "8px" }}>{cliente.razonSocial}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          backgroundColor: "#e6f7ff",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>2. Emitir Recibo por Honorarios 📄</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="number"
            placeholder="ID del Cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          />
          <input
            type="number"
            placeholder="ID del Servicio"
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
          />
          <input
            type="number"
            placeholder="Monto Bruto (S/)"
            value={montoBruto}
            onChange={(e) => setMontoBruto(e.target.value)}
          />

          <button
            onClick={emitirRecibo}
            style={{ backgroundColor: "#0066cc", color: "white" }}
          >
            Emitir y Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
