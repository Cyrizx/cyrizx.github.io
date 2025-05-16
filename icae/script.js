function generarPDF() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const resultado = document.getElementById('input-resultado').value.trim();
  const numero = document.getElementById('input-numero').value.trim();
  const fechaInput = document.getElementById('input-fecha').value;

  if (!nombre || !resultado || !numero || !fechaInput) {
    alert("Completá todos los campos antes de generar el PDF.");
    return;
  }

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

      // Insertar los datos
      pdfContent.querySelector('#nombre-pdf').textContent = nombre;
      pdfContent.querySelector('#numero-pdf').textContent = numero;
      pdfContent.querySelector('#fecha-pdf').textContent = fechaFormateada;

      if (pdfContent.querySelector('#nombre-fotos')) pdfContent.querySelector('#nombre-fotos').textContent = nombre;
      if (pdfContent.querySelector('#numero-fotos')) pdfContent.querySelector('#numero-fotos').textContent = numero;

      pdfContent.style.display = 'block';
      pdfContent.style.position = 'relative';
      pdfContent.style.margin = '0';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:0;margin:0;';
      wrapper.appendChild(pdfContent);
      pdfPlaceholder.appendChild(wrapper);

      // Cargar imágenes en inputs (opcional si estás usando)
      const promesasImagenes = []; // podés agregar si usás input file

      Promise.all(promesasImagenes).then(() => {
        const pages = pdfContent.querySelectorAll('.pdf-page');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const options = { scale: 2, useCORS: true };

        const renderPage = (index) => {
          if (index >= pages.length) {
            pdf.output('blob').then(blob => {
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
            return;
          }

          html2canvas(pages[index], options).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (index > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            renderPage(index + 1);
          });
        };

        renderPage(0);
      });
    });
}

document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btn-generar');
  if (boton) {
    boton.addEventListener('click', generarPDF);
  }
});
