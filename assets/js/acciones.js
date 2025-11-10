let saldoReal = 1000.0;
let saldoVisible = true;
const numeroCuenta = "1234-5678-9012";
document.getElementById("numeroCuentaValor").textContent = numeroCuenta;

const params = new URLSearchParams(window.location.search);
const usuario = params.get("usuario") || "Invitado";
document.getElementById("saludoUsuario").textContent = `Hola, ${usuario}!`;

Swal.fire({
  icon: "info",
  title: `Bienvenido ${usuario} a Pokémon Bank`,
  text: "Selecciona una operación para comenzar.",
  confirmButtonText: "Continuar",
  confirmButtonColor: "#007bff",
});

// ================== Persona 4: persistencia ==================
function cargarEstadoP4() {
  const data = localStorage.getItem("pokemonBank");
  if (!data) {
    const inicial = { balance: saldoReal, transactions: [] };
    localStorage.setItem("pokemonBank", JSON.stringify(inicial));
    return inicial;
  }
  return JSON.parse(data);
}

function guardarEstadoP4(transaccion) {
  const state = cargarEstadoP4();
  state.balance = saldoReal;
  if (transaccion) state.transactions.push(transaccion);
  localStorage.setItem("pokemonBank", JSON.stringify(state));
}

// ================== UI helpers ==================
function actualizarSaldo() {
  const disponible = saldoReal;
  document.getElementById("saldoReal").textContent = `$${saldoReal.toFixed(2)}`;
  document.getElementById("saldoDisponible").textContent = `$${disponible.toFixed(2)}`;
  document.getElementById("saldoValor").textContent = saldoVisible ? `$${saldoReal.toFixed(2)}` : "****";
}
actualizarSaldo();

function mostrarAlerta({ icon, title, text, html }) {
  Swal.fire({
    icon,
    title,
    text: text || undefined,
    html,
    confirmButtonText: "OK",
    confirmButtonColor: "#007bff",
  });
}

// Toggle saldo
document.getElementById("toggleSaldo").addEventListener("click", () => {
  saldoVisible = !saldoVisible;
  document.getElementById("saldoValor").textContent = saldoVisible ? `$${saldoReal.toFixed(2)}` : "****";
  document.getElementById("toggleSaldo").classList.toggle("fa-eye");
  document.getElementById("toggleSaldo").classList.toggle("fa-eye-slash");
});

// Validar monto (##.##)
function validarMonto(monto) {
  return /^\d+(\.\d{1,2})?$/.test(monto);
}

// ================== Depósito ==================
document.getElementById("formDeposito").addEventListener("submit", (e) => {
  e.preventDefault();
  const monto = document.getElementById("montoDeposito").value.trim();

  if (monto === "" || parseFloat(monto) <= 0) {
    Swal.fire({ icon: "error", title: "Monto inválido", text: "Por favor ingresa un monto mayor a 0." });
    return;
  }

  Swal.fire({
    icon: "question",
    title: "¿Deseas realizar este depósito?",
    text: `Monto: $${parseFloat(monto).toFixed(2)}`,
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#28a745",
  }).then((result) => {
    if (result.isConfirmed) {
      saldoReal += parseFloat(monto);
      actualizarSaldo();

      guardarEstadoP4({
        id: `tx_${Date.now()}`,
        fecha: new Date().toISOString(),
        tipo: "Depósito",
        servicio: "-",
        monto: parseFloat(monto),
        saldo: saldoReal,
      });

      $("#depositoModal").modal("hide");
      document.getElementById("montoDeposito").value = "";
      Swal.fire({
        icon: "success",
        title: "Depósito exitoso",
        text: `Se depositaron $${parseFloat(monto).toFixed(2)} correctamente.`,
      });
    }
  });
});

// ================== Retiro ==================
document.getElementById("formRetiro").addEventListener("submit", (e) => {
  e.preventDefault();
  const monto = document.getElementById("montoRetiro").value.trim();

  if (monto === "" || parseFloat(monto) <= 0) {
    Swal.fire({ icon: "error", title: "Monto inválido", text: "Por favor ingresa un monto válido." });
    return;
  }
  if (parseFloat(monto) > saldoReal) {
    Swal.fire({ icon: "error", title: "Saldo insuficiente", text: "No puedes retirar más de tu saldo disponible." });
    return;
  }

  Swal.fire({
    icon: "warning",
    title: "Confirmar retiro",
    text: `¿Deseas retirar $${parseFloat(monto).toFixed(2)}?`,
    showCancelButton: true,
    confirmButtonText: "Sí, retirar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545",
  }).then((result) => {
    if (result.isConfirmed) {
      saldoReal -= parseFloat(monto);
      actualizarSaldo();

      guardarEstadoP4({
        id: `tx_${Date.now()}`,
        fecha: new Date().toISOString(),
        tipo: "Retiro",
        servicio: "-",
        monto: parseFloat(monto),
        saldo: saldoReal,
      });

      $("#retiroModal").modal("hide");
      document.getElementById("montoRetiro").value = "";
      Swal.fire({
        icon: "success",
        title: "Retiro exitoso",
        text: `Has retirado $${parseFloat(monto).toFixed(2)} correctamente.`,
      });
    }
  });
});

// ================== Pago de servicios ==================
const proveedores = {
  Agua: ["💧 Anda"],
  Electricidad: ["⚡ Del Sur", "⚡ CAESS", "⚡ Clesa"],
  Telefonia: ["📱 Movistar", "📱 Digicel", "📱 Claro"],
  Cable: ["📡 Claro", "📡 Tigo", "📡 Salnet"],
};

document.getElementById("servicio").addEventListener("change", function () {
  const sel = this.value;
  const provSelect = document.getElementById("proveedor");
  provSelect.innerHTML = '<option value="">--Selecciona un proveedor--</option>';
  if (sel && proveedores[sel]) {
    proveedores[sel].forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      provSelect.appendChild(opt);
    });
  }
});

document.getElementById("formPago").addEventListener("submit", (e) => {
  e.preventDefault();
  const monto = document.getElementById("montoServicio").value;
  const servicio = document.getElementById("servicio").value;
  const proveedor = document.getElementById("proveedor").value;

  if (validarMonto(monto) && parseFloat(monto) > 0 && parseFloat(monto) <= saldoReal && servicio && proveedor) {
    saldoReal -= parseFloat(monto);
    actualizarSaldo();

    guardarEstadoP4({
      id: `tx_${Date.now()}`,
      fecha: new Date().toISOString(),
      tipo: "Pago",
      servicio: `${servicio} - ${proveedor}`,
      monto: parseFloat(monto),
      saldo: saldoReal,
    });

    $("#pagoModal").modal("hide");
    document.getElementById("montoServicio").value = "";
    document.getElementById("servicio").value = "";
    document.getElementById("proveedor").value = "";

    mostrarAlerta({
      icon: "success",
      title: "Pago exitoso",
      text: `Se pagó $${parseFloat(monto).toFixed(2)} de ${servicio} a ${proveedor}`,
    });
  } else {
    mostrarAlerta({ icon: "error", title: "Error", text: "Monto inválido o datos incompletos." });
  }
});

// ================== Navegación ==================
document.getElementById("btnSalir").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.getElementById("btnHistorial").addEventListener("click", () => {
  const usuarioParam = encodeURIComponent(usuario);
  window.location.href = `historial.html?usuario=${usuarioParam}`;
});

// ================== Dashboard (donut + detalle) ==================
document.getElementById("btnGrafica").addEventListener("click", () => {
  // Mostrar modal y esperar a que esté completamente visible para renderizar el chart
  $("#graficaModal").modal("show");

  const state = cargarEstadoP4();
  const tx = state.transactions || [];

  const money = (n) => `$${Number(n || 0).toFixed(2)}`;
  const normTipo = (t = "") => {
    t = String(t).toLowerCase();
    if (t.includes("retiro")) return "Retiros";
    if (t.includes("pago")) return "Pagos";
    if (t.includes("dep")) return "Depósitos";
    return null; // omitimos consultas
  };

  // Crea buckets
  const tipos = ["Depósitos", "Retiros", "Pagos"];
  const buckets = { Depósitos: [], Retiros: [], Pagos: [] };
  tx.forEach((t) => {
    const k = normTipo(t.tipo || t.type);
    if (k) buckets[k].push(t);
  });

  // Donut counts
  const counts = tipos.map((t) => buckets[t].length);
  const canvas = document.getElementById("grafDonut");
  const btnClear = document.getElementById("btnQuitarFiltro");
  const title = document.getElementById("tituloDetalle");
  const tbody = document.getElementById("bodyDetalle");

  let filtro = null; // 'Depósitos' | 'Retiros' | 'Pagos' | null

  function renderDetalle() {
    const source = filtro ? buckets[filtro] : tx.filter((t) => !!normTipo(t.tipo || t.type));
    const rows = source.slice().reverse().slice(0, 12);

    title.textContent = filtro ? `Detalle — ${filtro}` : "Detalle reciente";
    btnClear.style.display = filtro ? "inline-block" : "none";

    tbody.innerHTML = "";
    if (!rows.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6" class="text-center text-muted">Sin transacciones.</td>`;
      tbody.appendChild(tr);
      return;
    }
    rows.forEach((t, i) => {
      const fecha = new Date(t.fecha || t.dateISO).toLocaleString();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${fecha}</td>
        <td>${t.tipo || t.type}</td>
        <td>${t.servicio || t.service || "-"}</td>
        <td class="text-end">${money(t.monto || t.amount)}</td>
        <td class="text-end">${money(t.saldo || t.balanceAfter)}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Inicializador del chart que se ejecuta cuando el modal está completamente visible
  const initChart = () => {
    // limpiar gráfico previo
    if (window._donutTx) {
      try { window._donutTx.destroy(); } catch (e) { /* ignore */ }
      window._donutTx = null;
    }

    // tamaño fijo para el donut (evita problemas con el modal oculto/animado)
    canvas.style.display = "";
    canvas.width = 240;
    canvas.height = 240;

    const total = counts.reduce((a, b) => a + b, 0);
    // mostrar mensaje si no hay datos
    const existingMsg = document.getElementById("grafNoData");
    if (total === 0) {
      canvas.style.display = "none";
      if (!existingMsg) {
        const p = document.createElement("p");
        p.id = "grafNoData";
        p.className = "text-center text-muted mt-3";
        p.textContent = "No hay datos para graficar.";
        canvas.parentNode.insertBefore(p, canvas.nextSibling);
      } else {
        existingMsg.style.display = "";
      }
      renderDetalle();
      return;
    } else {
      if (existingMsg) existingMsg.style.display = "none";
    }

    const ctx = canvas.getContext("2d");

    window._donutTx = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: tipos,
        datasets: [
          {
            data: counts,
            backgroundColor: ["#28a745", "#dc3545", "#0d6efd"],
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "65%",
        plugins: {
          legend: {
            position: "top",
            onClick: (_, item) => {
              const t = item.text;
              filtro = filtro === t ? null : t;
              renderDetalle();
            },
          },
          tooltip: { enabled: true },
        },
        onClick: (evt, els) => {
          if (!els.length) return;
          const idx = els[0].index;
          const t = tipos[idx];
          filtro = filtro === t ? null : t;
          renderDetalle();
        },
      },
    });

    btnClear.onclick = () => {
      filtro = null;
      renderDetalle();
    };

    renderDetalle();
  };

  // Crear chart cuando el modal termine de mostrarse (asegura dimensiones calculadas)
  $("#graficaModal").off("shown.bs.modal._donut").on("shown.bs.modal._donut", initChart);

  // Destruir chart y limpiar mensaje al ocultar
  $("#graficaModal").off("hidden.bs.modal._donut").on("hidden.bs.modal._donut", function () {
    if (window._donutTx) {
      try { window._donutTx.destroy(); } catch (e) { /* ignore */ }
      window._donutTx = null;
    }
    const nd = document.getElementById("grafNoData");
    if (nd) nd.remove();
  });
});