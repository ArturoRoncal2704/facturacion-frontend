import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  RocketLaunchIcon,
  MoonIcon,
  SunIcon,
  IdentificationIcon,
  EnvelopeIcon,
  BookmarkSquareIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  FolderIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const swalConfig = {
    background: isDarkMode ? "#0f172a" : "#ffffff",
    color: isDarkMode ? "#f1f5f9" : "#0f172a",
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-slate-950");
      document.body.classList.remove("bg-slate-50");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.add("bg-slate-50");
      document.body.classList.remove("bg-slate-950");
    }
  }, [isDarkMode]);

  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");

  const [nombreServicio, setNombreServicio] = useState("");
  const [descripcionServicio, setDescripcionServicio] = useState("");

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [montoBruto, setMontoBruto] = useState("");

  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [busquedaServicio, setBusquedaServicio] = useState("");
  const [mostrarDropdownServicio, setMostrarDropdownServicio] = useState(false);

  const cargarData = () => {
    fetch("http://localhost:8080/api/clientes")
      .then((res) => res.json())
      .then((datos) => {
        const datosOrdenados = datos.sort((a, b) => a.id - b.id);
        setClientes(datosOrdenados);
      });

    fetch("http://localhost:8080/api/servicios")
      .then((res) => res.json())
      .then((datos) => {
        const datosOrdenados = datos.sort((a, b) => a.id - b.id);
        setServicios(datosOrdenados);
      });
  };

  useEffect(() => {
    cargarData();
  }, []);

  const guardarCliente = async () => {
    if (!documento || !correo) {
      return Swal.fire({
        ...swalConfig,
        icon: "warning",
        title: "Faltan datos",
        text: "Por favor, ingresa la identificación y el correo.",
        confirmButtonColor: "#2563eb",
      });
    }

    const res = await fetch("http://localhost:8080/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rucDni: documento, email: correo }),
    });

    if (res.ok) {
      Swal.fire({
        ...swalConfig,
        icon: "success",
        title: "¡Éxito!",
        text: "Cliente guardado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      setDocumento("");
      setCorreo("");
      cargarData();
    }
  };

  const guardarServicio = async () => {
    if (!nombreServicio) {
      return Swal.fire({
        ...swalConfig,
        icon: "warning",
        title: "Faltan datos",
        text: "Por favor, ingresa el nombre del servicio.",
        confirmButtonColor: "#4f46e5",
      });
    }

    const res = await fetch("http://localhost:8080/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreServicio,
        descripcion:
          descripcionServicio.trim() === ""
            ? "Sin descripción"
            : descripcionServicio,
      }),
    });

    if (res.ok) {
      Swal.fire({
        ...swalConfig,
        icon: "success",
        title: "¡Éxito!",
        text: "Servicio guardado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      setNombreServicio("");
      setDescripcionServicio("");
      cargarData();
    }
  };

  const eliminarCliente = async (id) => {
    const confirmacion = await Swal.fire({
      ...swalConfig,
      title: "¿Estás seguro?",
      text: "Eliminarás este cliente permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/api/clientes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        Swal.fire({
          ...swalConfig,
          icon: "success",
          title: "Eliminado",
          text: "El cliente ha sido borrado con éxito.",
          timer: 2000,
          showConfirmButton: false,
        });
        cargarData();
      } else {
        Swal.fire({
          ...swalConfig,
          icon: "error",
          title: "Error al eliminar",
          text: "No se pudo borrar. Tal vez el cliente ya tiene recibos emitidos.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        ...swalConfig,
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar al servidor al intentar eliminar.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const emitirRecibo = async () => {
    if (!clienteId || !servicioId || !montoBruto) {
      return Swal.fire({
        ...swalConfig,
        icon: "warning",
        title: "Faltan datos",
        text: "Completa todos los campos para emitir el recibo.",
        confirmButtonColor: "#2563eb",
      });
    }

    Swal.fire({
      ...swalConfig,
      title: "Generando documento...",
      text: "Por favor espera un momento.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("http://localhost:8080/api/recibos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, servicioId, montoBruto }),
      });

      if (!res.ok) {
        return Swal.fire({
          ...swalConfig,
          icon: "error",
          title: "Error al emitir",
          text: "Ocurrió un problema en el servidor.",
          confirmButtonColor: "#2563eb",
        });
      }

      const recibo = await res.json();
      const pdf = await fetch(
        `http://localhost:8080/api/recibos/${recibo.id}/pdf`,
      );

      if (pdf.ok) {
        const url = window.URL.createObjectURL(await pdf.blob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `Recibo_${recibo.id}.pdf`;
        a.click();

        Swal.fire({
          ...swalConfig,
          icon: "success",
          title: "¡Recibo Emitido!",
          text: "La descarga ha comenzado.",
          timer: 2000,
          showConfirmButton: false,
        });

        setClienteId("");
        setBusquedaCliente("");
        setServicioId("");
        setBusquedaServicio("");
        setMontoBruto("");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        ...swalConfig,
        icon: "error",
        title: "Error de red",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-24 font-sans transition-colors duration-300 text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 dark:text-white">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <RocketLaunchIcon className="h-6 w-6" />
              </div>
              Sistema de Facturación
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 ml-14 text-sm">
              Gestión SaaS v2.0
            </p>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-slate-600" />
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-semibold flex items-center gap-3 mb-6 dark:text-white">
              <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                1
              </span>
              Nuevo Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Identificación
                </label>
                <div className="relative">
                  <IdentificationIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white"
                    placeholder="Ingresar DNI o RUC"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white"
                    placeholder="ejemplo@empresa.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={guardarCliente}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex justify-center items-center gap-2"
              >
                <BookmarkSquareIcon className="h-5 w-5" />
                Guardar Cliente
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <h2 className="text-lg font-semibold flex items-center gap-3 mb-6 dark:text-white">
              <span className="bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                2
              </span>
              Nuevo Servicio
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Nombre del Servicio
                </label>
                <div className="relative">
                  <WrenchScrewdriverIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
                    placeholder="Ej. Desarrollo Web"
                    value={nombreServicio}
                    onChange={(e) => setNombreServicio(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Descripción (Opcional)
                </label>
                <div className="relative">
                  <DocumentTextIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white"
                    placeholder="Detalles breves..."
                    value={descripcionServicio}
                    onChange={(e) => setDescripcionServicio(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={guardarServicio}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition flex justify-center items-center gap-2"
              >
                <TagIcon className="h-5 w-5" />
                Guardar Servicio
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-3">
              <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Base de Datos de Clientes
            </h2>
            <div className="flex items-center gap-3 text-slate-400">
              <button className="hover:text-blue-500 transition">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button className="hover:text-blue-500 transition">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="px-6 py-4 text-left">ID Cliente</th>
                  <th className="px-6 py-4 text-left">Documento</th>
                  <th className="px-6 py-4 text-left">Razón Social</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientes.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                      #{String(c.id).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300">
                      {c.rucDNI}
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white">
                      {c.razonSocial}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => eliminarCliente(c.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        title="Borrar Cliente"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative transition-colors">
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 bg-blue-500/10 h-64 w-64 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-semibold flex items-center gap-3 mb-6 dark:text-white">
              <span className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                3
              </span>
              Emitir Recibo{" "}
              <DocumentTextIcon className="h-6 w-6 text-slate-400 ml-auto" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="relative">
                <UserIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400 z-10" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400"
                  placeholder="Buscar Cliente..."
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setMostrarDropdownCliente(true);
                    setClienteId("");
                  }}
                  onFocus={() => setMostrarDropdownCliente(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownCliente(false), 200)
                  }
                />
                {mostrarDropdownCliente && (
                  <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {clientes.filter(
                      (c) =>
                        c.razonSocial
                          .toLowerCase()
                          .includes(busquedaCliente.toLowerCase()) ||
                        c.rucDNI.includes(busquedaCliente),
                    ).length > 0 ? (
                      clientes
                        .filter(
                          (c) =>
                            c.razonSocial
                              .toLowerCase()
                              .includes(busquedaCliente.toLowerCase()) ||
                            c.rucDNI.includes(busquedaCliente),
                        )
                        .map((c) => (
                          <li
                            key={c.id}
                            className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50"
                            onClick={() => {
                              setClienteId(c.id);
                              setBusquedaCliente(c.razonSocial);
                              setMostrarDropdownCliente(false);
                            }}
                          >
                            <div className="font-medium">{c.razonSocial}</div>
                            <div className="text-xs text-blue-500 mt-0.5 font-semibold">
                              RUC/DNI: {c.rucDNI}
                            </div>
                          </li>
                        ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-slate-500 text-center">
                        No se encontraron resultados
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="relative">
                <BriefcaseIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400 z-10" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400"
                  placeholder="Buscar Servicio..."
                  value={busquedaServicio}
                  onChange={(e) => {
                    setBusquedaServicio(e.target.value);
                    setMostrarDropdownServicio(true);
                    setServicioId("");
                  }}
                  onFocus={() => setMostrarDropdownServicio(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownServicio(false), 200)
                  }
                />
                {mostrarDropdownServicio && (
                  <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {servicios.filter((s) =>
                      (s.nombre || s.descripcion)
                        .toLowerCase()
                        .includes(busquedaServicio.toLowerCase()),
                    ).length > 0 ? (
                      servicios
                        .filter((s) =>
                          (s.nombre || s.descripcion)
                            .toLowerCase()
                            .includes(busquedaServicio.toLowerCase()),
                        )
                        .map((s) => (
                          <li
                            key={s.id}
                            className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50"
                            onClick={() => {
                              setServicioId(s.id);
                              setBusquedaServicio(s.nombre || s.descripcion);
                              setMostrarDropdownServicio(false);
                            }}
                          >
                            {s.nombre || s.descripcion}
                          </li>
                        ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-slate-500 text-center">
                        No se encontraron servicios
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="relative">
                <CurrencyDollarIcon className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white placeholder-slate-400"
                  placeholder="0.00"
                  value={montoBruto}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setMontoBruto(val);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-slate-400">
                  PEN
                </span>
              </div>

              <button
                onClick={emitirRecibo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex justify-center items-center gap-2"
              >
                <PrinterIcon className="h-5 w-5" />
                Emitir y Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
        © 2026 Sistema SaaS. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;
