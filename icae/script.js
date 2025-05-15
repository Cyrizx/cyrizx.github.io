function generarPDF() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const resultado = document.getElementById('input-resultado').value.trim();
  const numero = document.getElementById('input-numero').value.trim();

  if (!nombre || !resultado || !numero) {
    alert("Completá todos los campos antes de generar el PDF.");
    return;
  }

  const pdfPlaceholder = document.getElementById('pdf-placeholder');
  pdfPlaceholder.innerHTML = '';

  fetch('template.html')
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pdfContent = doc.querySelector('#pdf-content');

      // Insertar los datos en el template
      pdfContent.querySelector('#nombre-pdf').textContent = nombre;
      pdfContent.querySelector('#numero-pdf').textContent = numero;
      pdfContent.querySelector('#fecha-pdf').textContent = new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Preparar contenido para el PDF
      pdfContent.style.display = 'block';
      pdfContent.style.position = 'relative';
      pdfContent.style.margin = '0';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:0;margin:0;';
      wrapper.appendChild(pdfContent);
      pdfPlaceholder.appendChild(wrapper);

      // Generar y descargar PDF directamente
      html2pdf()
        .set({
          margin: 0,
          filename: 'evaluacion.pdf',
          html2canvas: { scale: 3, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(pdfContent)
        .save() // ✅ descarga automática
        .then(() => {
          pdfContent.remove(); // limpieza del DOM
        });
    })
    .catch(err => {
      console.error("Error al cargar template.html:", err);
      alert("No se pudo cargar la plantilla.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btn-generar');
  if (boton) {
    boton.addEventListener('click', generarPDF);
  }
});
