const container = document.getElementById("container"); 
const selectedOpt = document.getElementById("opts");

const API_BASE = "https://ghibliapi.vercel.app";

const endpointMap = {
  "Lugares": "locations",
  "Personajes": "people",
  "Criaturas": "species",
  "Filmes": "films",
  "Vehiculos": "vehicles"
};

selectedOpt.addEventListener("change", async (event) => {
  const opcionSeleccionada = event.target.value;

  if (!opcionSeleccionada) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <p class="text-[#fabd2f] text-xl font-medium animate-pulse">Buscando ${opcionSeleccionada.toLowerCase()} en el catálogo...</p>
    </div>
  `;

  const endpoint = endpointMap[opcionSeleccionada];

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();
    renderResults(data, opcionSeleccionada);

  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="col-span-full text-center py-8 bg-[#cc241d]/10 border border-[#cc241d] rounded-xl p-4">
        <p class="text-[#fb4934] font-semibold">No se pudieron cargar los datos de la API.</p>
      </div>
    `;
  }
});

function renderResults(items, tipo) {
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-[#a89984]">No se encontraron resultados.</p>`;
    return;
  }

  // Mapeamos los objetos en tarjetas interactivas de Tailwind
  const tarjetasHTML = items.slice(0, 12).map(item => {
    const titulo = item.title || item.name || "Elemento Desconocido";
    const tituloOriginal = item.original_title ? `<span class="block text-xs font-normal text-[#8ec07c] mt-0.5">${item.original_title}</span>` : "";
    
    // Datos opcionales según el tipo de respuesta de la API
    const badgeText = item.release_date || item.gender || item.classification || "Studio Ghibli";
    const subtexto = item.director ? `Director: ${item.director}` : (item.climate ? `Clima: ${item.climate}` : "");
    const descripcion = item.description ? item.description.slice(0, 140) + "..." : "Sin descripción disponible para este registro.";

    // Si es un filme, intentamos renderizar su banner superior, si no, un color plano de fondo
    const bannerHTML = item.movie_banner 
      ? `<img src="${item.movie_banner}" alt="${titulo}" class="w-full h-32 object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-300" />`
      : `<div class="w-full h-4 bg-[#504945]"></div>`;

    return `
      <article class="group bg-[#3c3836] border border-[#504945] rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#fabd2f]/50 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
        
        <div>
          ${bannerHTML}
          
          <div class="p-5 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <h3 class="text-xl font-bold text-[#ebdbb2] group-hover:text-[#fabd2f] transition-colors duration-200 leading-snug">
                ${titulo}
                ${tituloOriginal}
              </h3>
              <span class="px-2 py-1 text-xs font-bold bg-[#282828] text-[#fe8019] rounded-md shrink-0">
                ${badgeText}
              </span>
            </div>
            
            <p class="text-[#bdae93] text-sm leading-relaxed">
              ${descripcion}
            </p>
          </div>
        </div>

        ${subtexto ? `
          <div class="px-5 py-3 bg-[#32302f] border-t border-[#504945] text-xs font-medium text-[#a89984] flex justify-between items-center">
            <span>${subtexto}</span>
          </div>
        ` : ""}

      </article>
    `;
  }).join("");

  container.innerHTML = tarjetasHTML;
}