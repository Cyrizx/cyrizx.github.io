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
      const fechaInput = document.getElementById('input-fecha').value;
      if (!fechaInput) {
        alert("Seleccioná una fecha para el examen.");
        return;
      }

      // Convertir "YYYY-MM-DD" a "DD de mes de YYYY"
      const [anio, mes, dia] = fechaInput.split("-");
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const fechaFormateada = `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;

      pdfContent.querySelector('#fecha-pdf').textContent = fechaFormateada;

      // Preparar contenido para el PDF
      pdfContent.style.display = 'block';
      pdfContent.style.position = 'relative';
      pdfContent.style.margin = '0';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:0;margin:0;';
      wrapper.appendChild(pdfContent);
      pdfPlaceholder.appendChild(wrapper);

      // Esperar a que todas las imágenes estén cargadas
      const imagenes = pdfContent.querySelectorAll('img');
      const promesasCarga = Array.from(imagenes).map(img => {
        return new Promise(resolve => {
          if (img.complete && img.naturalHeight !== 0) return resolve();
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      Promise.all(promesasCarga).then(() => {
        // Generar el PDF y subir a File.io
        html2pdf()
          .set({
            margin: 0,
            filename: 'evaluacion.pdf',
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          })
          .from(pdfContent)
          .outputPdf('blob')
          .then(blob => {
            const formData = new FormData();
            formData.append("file", blob, "evaluacion.pdf");

            fetch("https://store1.gofile.io/uploadFile", {
              method: "POST",
              body: formData
            })
              .then(res => res.json())
              .then(data => {
                if (data.status === "ok") {
                  const link = document.createElement('a');
                  link.href = data.data.downloadPage;
                  link.textContent = "📄 Descargar PDF generado";
                  link.target = "_blank";
                  link.className = "btn btn-outline-primary mt-3";

                  const output = document.getElementById("pdf-placeholder");
                  output.innerHTML = '';
                  output.appendChild(link);
                } else {
                  alert("Error al subir el PDF.");
                  console.error(data);
                }
                pdfContent.remove();
              })
              .catch(err => {
                alert("Error al conectar con file.io");
                console.error(err);
                pdfContent.remove();
              });
          });
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
