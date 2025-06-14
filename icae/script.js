function limpiarNombre(nombre) {
  return nombre
    .normalize("NFD")                    // Descompone letras con tildes
    .replace(/[\u0300-\u036f]/g, "")    // Elimina los signos diacríticos (acentos)
    .replace(/[^a-zA-Z0-9]/g, "_")      // Reemplaza todo lo que no sea alfanumérico por "_"
    .toLowerCase();                     // Opcional: convertir todo a minúsculas
}

function generarPDF() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const resultado = document.getElementById('input-resultado').value;
  const numero = document.getElementById('input-numero').value.trim();
  const fechaInput = document.getElementById('input-fecha').value;
  const horainicio = document.getElementById('input-horainicio').value;
  const horafin = document.getElementById('input-horafin').value;
  const grupo = document.getElementById('input-grupo').value;

  // ✅ Verificar el estado del switch
  const switchSoloPrimera = document.getElementById("switchSoloPrimera");
  const esPiloto = switchSoloPrimera?.checked;

  // ✅ Si es evaluación de piloto, validar que se haya seleccionado instructor
  if (esPiloto) {
    const instructorSeleccionado = document.getElementById('select-instructor').value;
    if (!instructorSeleccionado) {
      alert("Por favor, selecciona un instructor para la evaluación de piloto.");
      return;
    }
  }

  if (!nombre || !resultado || !numero || !fechaInput) {
    alert("Completá todos los campos antes de generar el PDF.");
    return;
  }

  document.getElementById('pdf-loader').style.display = 'inline-block';

  const [anio, mes, dia] = fechaInput.split("-");
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaFormateada = `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} del ${anio}`;

  document.getElementById('pdf-render').innerHTML = '';
  document.getElementById('pdf-link-container').innerHTML = '';

  fetch('template.html')
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const pdfContent = doc.querySelector('#pdf-content');

      pdfContent.querySelector('#nombre-participante').textContent = nombre.toUpperCase();
      pdfContent.querySelector('#nombre-pagina2').textContent = nombre;
      pdfContent.querySelector('#nombre-pagina3').textContent = nombre;

      pdfContent.querySelector('#numero-texto').textContent = numero;
      pdfContent.querySelector('#numero-pagina2').textContent = numero;
      pdfContent.querySelector('#numero-pagina3').textContent = numero;

      pdfContent.querySelector('#resultado-pdf').textContent = resultado;
      pdfContent.querySelector('#fecha-pdf').textContent = fechaFormateada;
      pdfContent.querySelector('#fecha-tit').textContent = fechaFormateada;

      pdfContent.querySelector('#horainicio-pdf').textContent = horainicio;
      pdfContent.querySelector('#horafin-pdf').textContent = horafin;
      pdfContent.querySelector('#grupo-pdf').textContent = grupo;

      // ✅ CONFIGURAR EXAMINADOR E INSTRUCTOR SEGÚN EL ESTADO DEL SWITCH
      if (esPiloto) {
        // Si el switch está activado (evaluación de piloto)
        const instructorSeleccionado = document.getElementById('select-instructor').value;
        
        // Buscar y configurar examinador-pdf
        const examinadorElement = pdfContent.querySelector('#examinador-pdf');
        if (examinadorElement) {
          examinadorElement.textContent = "Cap. P.A. Alfonso Guillermo Aguayo";
        }
        
        // Buscar y configurar instructor-pdf
        const instructorElement = pdfContent.querySelector('#instructor-pdf');
        const instructnam = pdfContent.querySelector('#inst-pdf');
        if (instructorElement) {
          instructorElement.textContent = instructorSeleccionado;
          instructnam.textContent = 'nuestro instructor '
        }
      }
      // Si el switch no está activado, los valores del template se mantienen como están

      // ✅ APLICAR EL FILTRO DE PÁGINAS AQUÍ ANTES DE CONTINUAR
      if (esPiloto) {
        const paginas = pdfContent.querySelectorAll(".pdf-page");
        // Eliminar todas las páginas excepto la primera
        for (let i = paginas.length - 1; i >= 1; i--) {
          paginas[i].remove();
        }
      }

      const nombreLimpio = limpiarNombre(nombre);

      pdfContent.style.display = 'block';
      pdfContent.style.position = 'relative';
      pdfContent.style.margin = '0';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:0;margin:0;';
      wrapper.appendChild(pdfContent);

      const renderDiv = document.getElementById('pdf-render');
      renderDiv.innerHTML = '';
      renderDiv.appendChild(wrapper);

      const campos = [
        // 1.	Equipo de Emergencia 
        { inputId: 'input-eme1', imgId: 'img-eme1' },
        { inputId: 'input-eme2', imgId: 'img-eme2' },
        
        // 2. Primeros Auxilios
        { inputId: 'input-prm1', imgId: 'img-prm1' },
        { inputId: 'input-prm2', imgId: 'img-prm2' },

        // 3.	Mercancías Peligrosas 
        { inputId: 'input-mep1', imgId: 'img-mep1' },
        { inputId: 'input-mep2', imgId: 'img-mep2' },

        // 4.	Despresurizacion de cabina
        { inputId: 'input-desc1', imgId: 'img-desc1' },
        { inputId: 'input-desc2', imgId: 'img-desc2' },

        // 5.	Emergencia no planeada
        { inputId: 'input-emep1', imgId: 'img-emep1' },
        { inputId: 'input-emep2', imgId: 'img-emep2' },
        // 6.	Emergencia planeada 
        { inputId: 'input-emepp1', imgId: 'img-emepp1' },
        { inputId: 'input-emepp2', imgId: 'img-emepp2' },
        // 7.	Humo en cabina 
        { inputId: 'input-humc1', imgId: 'input-humc1' },
        { inputId: 'input-humc2', imgId: 'input-humc2' },
        // 8.	Ditching
        { inputId: 'input-dtc1', imgId: 'img-dtc1' },
        { inputId: 'input-dtc2', imgId: 'img-dtc2' }
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
          } else {
            // ✅ No tocamos la imagen si no se cargó nada
            resolve();
          }
        });
      });

      Promise.all(promesasCarga).then(() => {
  const pages = pdfContent.querySelectorAll('.pdf-page');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', [279.4, 215.9]);
  const options = { scale: 2, useCORS: true };

  const renderPage = (index) => {
    if (index >= pages.length) {
      const blob = pdf.output('blob');

      const formData = new FormData();
      const nombreArchivo = `evaluacion_${nombreLimpio}.pdf`;
      formData.append("file", blob, nombreArchivo);

      fetch("https://store1.gofile.io/uploadFile", {
        method: "POST",
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "ok") {
            const link = document.createElement('a');
            link.href = data.data.downloadPage;
            link.textContent = `📄 Descargar Evaluacion de ${nombre} `;
            link.className = "btn btn-outline-primary";
            document.getElementById('pdf-link-container').innerHTML = '';
            document.getElementById('pdf-link-container').appendChild(link);
            document.getElementById('pdf-loader').style.display = 'none';
          } else {
            alert("Error al subir a GoFile.");
            console.error(data);
          }
          pdfContent.remove();
        })
        .catch(err => {
          alert("No se pudo conectar a GoFile.io");

          // Fallback: abrir el PDF en una pestaña nueva
          const fallbackUrl = URL.createObjectURL(blob);
          window.open(fallbackUrl, '_blank');

          console.error(err);
          pdfContent.remove();
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

    })
    .catch(err => {
      console.error("Error al cargar template.html:", err);
      alert("No se pudo cargar la plantilla.");
    });
}

function configurarChecksPorSeccion() {
  const secciones = [
    { id: 'eme', inputs: ['input-eme1', 'input-eme2'] },
    { id: 'prm', inputs: ['input-prm1', 'input-prm2'] },
    { id: 'mep', inputs: ['input-mep1', 'input-mep2'] },
    { id: 'desc', inputs: ['input-desc1', 'input-desc2'] },
    { id: 'emep', inputs: ['input-emep1', 'input-emep2'] },
    { id: 'emepp', inputs: ['input-emepp1', 'input-emepp2'] },
    { id: 'humc', inputs: ['input-humc1', 'input-humc2'] }
  ];

  secciones.forEach(({ id, inputs }) => {
    const check = document.getElementById(`check-${id}`);
    const input1 = document.getElementById(inputs[0]);
    const input2 = document.getElementById(inputs[1]);

    const validar = () => {
      if (input1.files.length > 0 && input2.files.length > 0) {
        check.style.display = 'inline';
      } else {
        check.style.display = 'none';
      }
    };

    input1.addEventListener('change', validar);
    input2.addEventListener('change', validar);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btn-generar');
  if (boton) {
    boton.addEventListener('click', generarPDF);
  }
  configurarChecksPorSeccion();
});