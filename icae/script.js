function generarPDF() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const resultado = document.getElementById('input-resultado').value.trim();
  const numero = document.getElementById('input-numero').value.trim();
  const fechaInput = document.getElementById('input-fecha').value;

  if (!nombre || !resultado || !numero || !fechaInput) {
    alert("Completá todos los campos antes de generar el PDF.");
    return;
  }

  // Formatear fecha manualmente
  const [anio, mes, dia] = fechaInput.split("-");
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaFormateada = `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;

  const pdfPlaceholder = document.getElementById('pdf-placeholder');
  pdfPlaceholder.innerHTML = '';

  fetch('template.html')
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pdfContent = doc.querySelector('#pdf-content');

      // Insertar datos básicos
      pdfContent.querySelector('#nombre-pdf').textContent = nombre;
      pdfContent.querySelector('#numero-pdf').textContent = numero;
      pdfContent.querySelector('#fecha-pdf').textContent = fechaFormateada;

      pdfContent.style.display = 'block';
      pdfContent.style.position = 'relative';
      pdfContent.style.margin = '0';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:0;margin:0;';
      wrapper.appendChild(pdfContent);
      pdfPlaceholder.appendChild(wrapper);

      // Cargar imágenes desde los inputs
      const campos = [
        { inputId: 'input-eme1', imgId: 'img-eme1' },
        { inputId: 'input-eme2', imgId: 'img-eme2' },
        { inputId: 'input-prm1', imgId: 'img-prm1' },
        { inputId: 'input-prm2', imgId: 'img-prm2' }
      ];

      const promesasCarga = campos.map(({ inputId, imgId }) => {
        const input = document.getElementById(inputId);
        const img = pdfContent.querySelector(`#${imgId}`);

        return new Promise(resolve => {
          if (input && input.files.length > 0 && img) {
            const reader = new FileReader();
            reader.onload = e => {
              img.src = e.target.result;
              resolve();
            };
            reader.readAsDataURL(input.files[0]);
          } else if (img) {
            img.remove(); // si no hay imagen cargada, eliminarla del template
            resolve();
          } else {
            resolve();
          }
        });
      });

      Promise.all(promesasCarga).then(() => {
        // Generar y subir PDF
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

                  pdfPlaceholder.innerHTML = '';
                  pdfPlaceholder.appendChild(link);
                } else {
                  alert("Error al subir a GoFile.");
                  console.error(data);
                }
                pdfContent.remove();
              })
              .catch(err => {
                alert("No se pudo conectar a GoFile.io");
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
