
let saldoReal = 500.00;
let saldoVisible = true;
let historialDeTransacciones = [];

function cargarHisorial() {
  const historialGuardado = localStorage.getItem('HistorialDelUsuario');
  if(historialGuardado) {
    historialDeTransacciones = JSON.parse(historialGuardado);
  }
}

function actualizarSaldo(){
  const disponible = saldoReal;
  document.getElementById('saldoReal').textContent = `$${saldoReal.toFixed(2)}`;
  document.getElementById('saldoDisponible').textContent = `$${disponible.toFixed(2)}`;
  document.getElementById('saldoValor').textContent = saldoVisible ? `$${saldoReal.toFixed(2)}` : '****';
}

function mostrarAlerta({icon,title,text,html}) {
  Swal.fire({icon,title,text:text||undefined,html,confirmButtonText:'OK',confirmButtonColor:'#007bff'});
}

function registrarTransaccion(tipo, monto) {
  const transaccion = {
    id: historialDeTransacciones.length +1, 
    tipo: tipo, 
    monto: parseFloat(monto).toFixed(2), 
    fecha: new Date().toLocaleDateString('es-SV'),
    saldoFinal: saldoReal.toFixed(2),
  };

  historialDeTransacciones.push(transaccion); 
  localStorage.setItem('HistorialDelUsuario', JSON.stringify(historialDeTransacciones));

}

cargarHisorial();
actualizarSaldo();

const numeroCuenta = "1234-5678-9012";
document.getElementById('numeroCuentaValor').textContent = numeroCuenta;

const params = new URLSearchParams(window.location.search);
const usuario = params.get('usuario') || "Invitado";
document.getElementById('saludoUsuario').textContent = `Hola, ${usuario}!`;

Swal.fire({
  icon: "info",
  title: `Bienvenido ${usuario} a Pokémon Bank`,
  text: "Selecciona una operación para comenzar.",
  confirmButtonText: "Continuar",
  confirmButtonColor: "#007bff"
});


// Toggle saldo
document.getElementById('toggleSaldo').addEventListener('click',()=>{
  saldoVisible=!saldoVisible;
  document.getElementById('saldoValor').textContent = saldoVisible ? `$${saldoReal.toFixed(2)}` : '****';
  document.getElementById('toggleSaldo').classList.toggle('fa-eye');
  document.getElementById('toggleSaldo').classList.toggle('fa-eye-slash');
});


// Validar monto
function validarMonto(monto){ return /^\d+(\.\d{1,2})?$/.test(monto); }

// Depósito
function depositar(e) {
  e.preventDefault();
  const montoDepositado = document.getElementById('montoDeposito').value.trim(); 
  const monto = parseFloat(montoDepositado);
  const constraints = {
    monto: {presence: { message: "No puede estar vacio"}, numericality: {greaterThan: 0, message: "Debe ser un numero mayor a 0."}}
  };

  const error = validate({ monto: montoDepositado}, constraints); 

  if(error) {
    mostrarAlerta({icon: "error", title: "Monto invalido", text: `El monto ${error.monto[0]}`})
    return; 
  }

  Swal.fire({
    icon: "question", title: "Deseas realizar este deposito?", text: `Monto: $${monto.toFixed(2)}`,
    showCancelButton: true, confirmButtonText: "Si, continuar", confirmButtonColor: "#dc3545",
  }).then((result) => {
    if(result.isConfirmed) {
      saldoReal += monto; 
      registrarTransaccion('Deposito', monto); 
      actualizarSaldo();

      $('#depositoModal').modal('hide'); 
      document.getElementById('montoDeposito').value = "";
      mostrarAlerta({icon: "success", title: "El deposito fue exitoso", text: `El deposito de $${monto.toFixed(2)} fue exitoso.` });

    }
  });
}


// Retiro
function Retiro(e) {
  e.preventDefault(); 
  const montoRetirado = document.getElementById('montoRetiro').value.trim(); 
  const monto = parseFloat(montoRetirado);

  const constraints ={
    monto: {presence: { message: "No puede estar vacio"}, numericality: {greaterThan: 0, message: "Debe ser un numero mayor a 0."}}
  }; 

  const error = validate({monto: montoRetirado}, constraints); 

  if(error) {
    mostrarAlerta({icon: "error", title: "Monto invalido", text: `El monto ${error.monto[0]}`})
  }

  if(monto > saldoReal) {
    mostrarAlerta({icon: "error", title: "Saldo insuficiente", text: "No puedes retirar más dinero del que tienes disponible."});
    return;
  }

    Swal.fire({
    icon: "warning", title: "Deseas realizar este returo?", text: `Monto: $${monto.toFixed(2)}`,
    showCancelButton: true, confirmButtonText: "Si, continuar", cancelButtonText: "Cancelar", confirmButtonColor: "#dc3545",
  }).then((result) => {
    if(result.isConfirmed) {
      saldoReal -= monto; 
      registrarTransaccion('Retiro', monto); 
      actualizarSaldo();

      $('#retiroModal').modal('hide'); 
      document.getElementById('montoRetiro').value = ""; 
      mostrarAlerta({icon: "success", title: "El retiro fue exitoso", text: `El retiro de $${monto.toFixed(2)} fue exitoso.` });

    }
  });

}

// Proveedores
const proveedores = {
  Agua:["💧 Anda"],
  Electricidad:["⚡ Del Sur","⚡ CAESS","⚡ Clesa"],
  Telefonia:["📱 Movistar","📱 Digicel","📱 Claro"],
  Cable:["📡 Claro","📡 Tigo","📡 Salnet"]
};

// Cambiar proveedores según servicio
document.getElementById('servicio').addEventListener('change',function(){
  const sel = this.value;
  const provSelect = document.getElementById('proveedor');
  provSelect.innerHTML = '<option value="">--Selecciona un proveedor--</option>';
  if(sel && proveedores[sel]){
    proveedores[sel].forEach(p=>{
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p; provSelect.appendChild(opt);
    });
  }
});


function PagoServicios(e) {
  e.preventDefault(); 
  const montoPago = document.getElementById('montoServicio').value.trim();
  const servicio = document.getElementById('servicio').value; 
  const proveedor = document.getElementById('proveedor').value;
  const monto = parseFloat(montoPago);

  const constraints = {
    monto: {presence: { message: "No puede estar vacio"}, numericality: {greaterThan: 0, message: "Debe ser un numero mayor a 0."}},
    servicio: { presence: {message: "Debe ser seleccionado." }}, 
    proveedor: { presence: {message: "Debe ser seleccionado"}}
  }; 

  const datos = {monto: montoPago, servicio: servicio, proveedor: proveedor};
  const error = validate(datos, constraints); 

  if(error) {
    const mensajeError = Object.keys(error).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} ${error[key][0]}`).join('<br>');
    mostrarAlerta({ icon: 'error', title: 'Error de Validación', html: `Por favor corrige:<br>${mensajeError}` });
    return; 
  }

  if (monto > saldoReal) {
    mostrarAlerta({ icon: 'error', title: 'Saldo insuficiente', text: `Fondos insuficientes`});
    return;
  }

  Swal.fire({
    icon: "warning", title: "Deseas realizar este pago", text: `Pago de: $${monto.toFixed(2)} a ${proveedor} por ${servicio}?`,
    showCancelButton: true, confirmButtonText: "Si, continuar", cancelButtonText: "Cancelar", confirmButtonColor: "#dc3545",
  }).then((result) => {
    if(result.isConfirmed) {
      saldoReal -= monto; 
      registrarTransaccion(`Pago: ${servicio} (${proveedor})`, monto); 
      actualizarSaldo();

      $('#pagoModal').modal('hide'); 
      document.getElementById('montoServicio').value = '';
      document.getElementById('servicio').value = ''; 
      document.getElementById('proveedor').value = ''; 
      mostrarAlerta({icon: "success", title: "El pago fue exitoso", text: `El pago de $${monto.toFixed(2)} por el servicio de ${servicio} a ${proveedor} fue exitoso.` });

    }
  });


}

document.getElementById('formDeposito').addEventListener('submit', depositar); 
document.getElementById('formRetiro').addEventListener('submit', Retiro); 
document.getElementById('formPago').addEventListener('submit', PagoServicios); 

document.getElementById('btnSalir').addEventListener('click',()=>{ window.location.href='index.html'; });

document.getElementById('btnHistorial').addEventListener('click', () => {
    const usuarioParam = encodeURIComponent(usuario);
    window.location.href = `historial.html?usuario=${usuarioParam}`;
});


document.getElementById('btnGrafica').addEventListener('click',()=>{
    $('#graficaModal').modal('show');
    const ctx = document.getElementById('chartTransacciones').getContext('2d');
    if(window.chartInstance) window.chartInstance.destroy();
    window.chartInstance = new Chart(ctx,{
        type:'bar',
        data:{labels:['Depósitos','Retiros','Pagos'],datasets:[{label:'Cantidad de transacciones',data:[5,3,2],backgroundColor:['#28a745','#dc3545','#007bff']}]},
        options:{responsive:true}
    });
});
