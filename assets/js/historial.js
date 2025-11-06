// 1. Obtener el usuario desde la URL
const params = new URLSearchParams(window.location.search);
const usuario = params.get('usuario') || "Invitado";

// 2. Mostrar el nombre del usuario en la esquina superior derecha
const nombreUsuario = document.querySelector('.nombreusuario');
if (nombreUsuario) {
  nombreUsuario.textContent = usuario;
}

// 3. Verificar si hay transacciones en la tabla
document.addEventListener('DOMContentLoaded', () => {
  const filas = document.querySelectorAll('tbody tr');

  if (filas.length === 0) {
    // Si no hay registros
    Swal.fire({
      icon: "info",
      title: "Sin transacciones registradas",
      text: "Aún no existen movimientos en tu cuenta.",
      confirmButtonColor: "#007bff",
    });
  } else {
    // Si sí hay registros
    Swal.fire({
      icon: "success",
      title: `Historial cargado exitosamente`,
      text: `Se encontraron ${filas.length} transacciones registradas.`,
      confirmButtonColor: "#007bff",
    });
  }
});
