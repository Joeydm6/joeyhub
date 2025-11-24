// offerte.js

// Templates (Joey/Carlo) configuratie en UI-selector
const templates = {
  Joey: {
    naam: "JDM Holding B.V.",
    infoRegels: [
      "JDM Holding B.V.",
      "Vinkenstraat 13",
      "3136 HB Vlaardingen",
      "joey@klassebv.nl",
      "Tel: 0625300071",
      "KvK: 80710484",
      "BTW: NL861770031B01",
      "Bank: NL37 RABO 0370 6868 29"
    ],
    logo: null
  },
  Carlo: {
    naam: "Care Schilder en Behangwerk",
    infoRegels: [
      "Care Schilder en Behangwerk",
      "Rivierstraat 109",
      "6541 VJ Nijmegen",
      "Tel: 06 40 98 08 95",
      "Email: info@careschilderwerk.nl",
      "Website: careschilderwerk.nl",
      "Bankrekeningnummer: NL19KNAB0776902342",
      "Naam rekeninghouder: CTA Roelofs"
    ],
    logo: "../img/care-schilder-logo_Tekengebied 1 kopie 5.png"
  }
};

let huidigeTemplate = "Joey";

function setupTemplateSelector() {
  const segment = document.getElementById("template-segment");
  const indicator = document.getElementById("segment-indicator");
  const btwLabelEl = document.getElementById("btw-label");
  if (!segment || !indicator) {
    huidigeTemplate = "Joey";
    return;
  }

  const buttons = segment.querySelectorAll("button[data-template]");
  huidigeTemplate = "Joey";
  indicator.style.transform = "translateX(0%)";
  btwLabelEl && (btwLabelEl.innerText = "mix");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const sel = btn.getAttribute("data-template");
      if (!sel || !templates[sel]) return;
      huidigeTemplate = sel;
      indicator.style.transform = sel === "Carlo" ? "translateX(100%)" : "translateX(0%)";
      btwLabelEl && (btwLabelEl.innerText = "mix");
      berekenTotaal();
    });
  });

  berekenTotaal();
}

function updateTemplateInfoBlock() {
  const block = document.getElementById("template-info");
  if (!block) return;
  const tpl = templates[huidigeTemplate];
  block.innerHTML = `
    <div><strong>${tpl.naam}</strong></div>
    <div>${tpl.infoRegels.join("<br>")}</div>
  `;
}

async function loadImageDataURL(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

async function getImageDimensions(dataURL) {
  return await new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.src = dataURL;
  });
}

document.addEventListener("DOMContentLoaded", setupTemplateSelector);

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth()+1).padStart(2, "0")}/${date.getFullYear()}`;
}

function applyTekstTemplate(type) {
  const area = document.getElementById("offerte-tekst");
  if (!area) return;
  const templates = {
    schilder: "Geachte klant,\n\nHierbij bieden wij onze schilderdiensten aan. Deze offerte omvat het zorgvuldig schuren, voorbehandelen en afwerken van de te schilderen oppervlakken met hoogwaardige materialen. Wij streven naar een strak en duurzaam resultaat.\n\nOnderstaande specificatie geeft een uitsplitsing van werkzaamheden en kosten.",
    webdesign: "Beste klant,\n\nDank voor de interesse in onze webdesign diensten. In deze offerte beschrijven wij het ontwerp, de ontwikkeling en oplevering van een moderne, responsieve website inclusief basis SEO.\n\nHieronder vindt u de specificaties en bijbehorende kosten.",
    seo: "Beste,\n\nMet deze offerte stellen wij een traject voor om uw online vindbaarheid te verbeteren middels technische optimalisaties, contentverbeteringen en linkbuilding.\n\nDe onderstaande posten vormen de raming van werkzaamheden en kosten.",
    algemeen: "Geachte heer/mevrouw,\n\nHierbij treft u onze offerte aan voor de gevraagde werkzaamheden. Wij werken transparant en leveren kwaliteit met oog voor detail.\n\nOnderstaand vindt u een specificatie van de onderdelen en kosten."
  };
  area.value = templates[type] || "";
}

function vulDummyGegevens() {
  const today = new Date().toISOString().split("T")[0];
  const dummyData = {
    naam: "Voorbeeld Klant B.V.",
    adres: "Industriestraat 5",
    postcode: "1234 AB",
    woonplaats: "Rotterdam",
    factuurnummer: "OFF-2025001",
    datum: today
  };
  for (const [id, value] of Object.entries(dummyData)) {
    const input = document.getElementById(id);
    if (input) input.value = value;
  }
  const area = document.getElementById("offerte-tekst");
  if (area) {
    applyTekstTemplate("algemeen");
  }
  document.getElementById("factuur-items").innerHTML = `
    <tr>
      <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="Voorbereiding & planning" /></td>
      <td><input type="number" class="prijs w-full p-2 text-gray-900" value="300" oninput="berekenTotaal()" /></td>
      <td><input type="number" class="aantal w-full p-2 text-gray-900" value="1" oninput="berekenTotaal()" /></td>
      <td>
        <select class="btw w-full p-2 text-gray-900" onchange="berekenTotaal()">
          <option value="21" selected>21%</option>
          <option value="9">9%</option>
          <option value="0">0%</option>
          <option value="verlegd">verlegd</option>
        </select>
      </td>
      <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
    </tr>
    <tr>
      <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="Uitvoering werkzaamheden" /></td>
      <td><input type="number" class="prijs w-full p-2 text-gray-900" value="500" oninput="berekenTotaal()" /></td>
      <td><input type="number" class="aantal w-full p-2 text-gray-900" value="2" oninput="berekenTotaal()" /></td>
      <td>
        <select class="btw w-full p-2 text-gray-900" onchange="berekenTotaal()">
          <option value="21">21%</option>
          <option value="9" selected>9%</option>
          <option value="0">0%</option>
          <option value="verlegd">verlegd</option>
        </select>
      </td>
      <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
    </tr>
  `;
  berekenTotaal();
}

function voegItemToe() {
  const tbody = document.getElementById("factuur-items");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="beschrijving w-full p-2 text-gray-900" oninput="berekenTotaal()" /></td>
    <td><input type="number" class="prijs w-full p-2 text-gray-900" value="0" oninput="berekenTotaal()" /></td>
    <td><input type="number" class="aantal w-full p-2 text-gray-900" value="1" oninput="berekenTotaal()" /></td>
    <td>
      <select class="btw w-full p-2 text-gray-900" onchange="berekenTotaal()">
        <option value="21" selected>21%</option>
        <option value="9">9%</option>
        <option value="0">0%</option>
        <option value="verlegd">verlegd</option>
      </select>
    </td>
    <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
  `;
  tbody.appendChild(row);
}

function verwijderItem(button) {
  const row = button.closest("tr");
  if (row) {
    row.remove();
    berekenTotaal();
  }
}

function berekenTotaal() {
  let subtotaal = 0;
  let btwTotaal = 0;
  document.querySelectorAll("#factuur-items tr").forEach(row => {
    const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
    const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
    const rijSub = prijs * aantal;
    subtotaal += rijSub;
    const btwVal = row.querySelector(".btw")?.value || "21";
    const perc = btwVal === "verlegd" ? 0 : (parseFloat(btwVal) || 0) / 100;
    btwTotaal += rijSub * perc;
  });
  const totaalBedrag = subtotaal + btwTotaal;
  const lbl = document.getElementById("btw-label");
  if (lbl) lbl.innerText = "mix";
  document.getElementById("subtotaal").innerText = subtotaal.toFixed(2);
  document.getElementById("btw").innerText = btwTotaal.toFixed(2);
  document.getElementById("totaal").innerText = totaalBedrag.toFixed(2);
}

// Genereer de offerte als PDF met behulp van jsPDF
async function genereerPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20, marginY = 20;
  const bedrijfsInfoX = 140;

  const tpl = templates[huidigeTemplate];

  // Ingevoerde offertegegevens
  const offertenummer = document.getElementById("factuurnummer").value || "";
  const offerteDatum = document.getElementById("datum").value;
  let geldigTotStr = "";
  if (offerteDatum) {
    const geldig = new Date(offerteDatum);
    geldig.setDate(geldig.getDate() + 30);
    geldigTotStr = formatDate(geldig.toISOString().split("T")[0]);
  }

  // Bedrijfsnaam en (optioneel) logo
  doc.setFont("helvetica", "bold").setFontSize(22);
  let headerStartY = marginY;
  if (tpl.logo) {
    const logoData = await loadImageDataURL(tpl.logo);
    if (logoData) {
      const dims = await getImageDimensions(logoData);
      const targetW = 70;
      const targetH = Math.max(24, (dims.height / dims.width) * targetW);
      const logoX = marginX;
      const logoY = marginY;
      doc.addImage(logoData, "PNG", logoX, logoY, targetW, targetH);
      headerStartY = logoY + targetH + 12;
    }
  }
  doc.text(tpl.naam, marginX, headerStartY);
  doc.setFontSize(12);

  // Offertegegevens onder de header
  const lh = 6;
  doc.text(`Offertenummer: ${offertenummer}`, marginX, headerStartY + 10);
  doc.text(`Offertedatum: ${formatDate(offerteDatum)}`, marginX, headerStartY + 10 + lh);
  doc.text(`Geldig tot: ${geldigTotStr}`, marginX, headerStartY + 10 + 2 * lh);

  // Klantgegevens linksboven
  const klantNaam = document.getElementById("naam").value || "Klantnaam";
  const klantAdres = document.getElementById("adres").value || "Adres";
  const klantPostcode = document.getElementById("postcode").value || "Postcode";
  const klantWoonplaats = document.getElementById("woonplaats").value || "Woonplaats";

  // Bedrijfsadres en info rechts
  doc.setFont("helvetica", "normal").setFontSize(10);
  const bedrijfsInfoRegels = tpl.infoRegels;
  let infoY = headerStartY;
  const maxInfoWidth = pageWidth - bedrijfsInfoX - marginX;
  bedrijfsInfoRegels.forEach((text) => {
    if (/^Naam rekeninghouder:/i.test(text)) {
      doc.text(text, bedrijfsInfoX, infoY);
      infoY += 5;
      return;
    }
    const wrapped = doc.splitTextToSize(text, Math.max(40, maxInfoWidth));
    wrapped.forEach((line) => {
      doc.text(line, bedrijfsInfoX, infoY);
      infoY += 5;
    });
    if (/Website:/i.test(text)) {
      infoY += 5;
    }
  });

  // Klantgegevens links
  const headerTextBottomY = headerStartY + 10 + 2 * lh;
  const afterHeaderY = Math.max(headerTextBottomY, infoY) + 12;
  doc.setFont("helvetica", "normal").setFontSize(12);
  doc.text(klantNaam, marginX, afterHeaderY);
  doc.text(klantAdres, marginX, afterHeaderY + 7);
  doc.text(`${klantPostcode} ${klantWoonplaats}`, marginX, afterHeaderY + 14);

  // Inleidende offerte-tekst (tussen gegevens en tabel)
  const offerteTekst = document.getElementById("offerte-tekst")?.value || "";
  let tekstStartY = afterHeaderY + 24;
  if (offerteTekst && offerteTekst.trim().length) {
    doc.setFont("helvetica", "normal").setFontSize(11);
    const wrappedTxt = doc.splitTextToSize(offerteTekst, pageWidth - marginX * 2);
    wrappedTxt.forEach((line) => {
      doc.text(line, marginX, tekstStartY);
      tekstStartY += 6;
    });
    tekstStartY += 6; // extra ruimte onder tekstblok
  }

  // Tabelkop: Omschrijving | Prijs | Aantal | BTW% | BTW | Totaal
  let tabelStartY = tekstStartY;
  const colPrijsX = 95;
  const colAantalX = 120;
  const colBtwPercX = 145;
  const colBtwX = 170;
  const colTotaalX = 200;
  doc.setFont("helvetica", "bold");
  doc.text("Omschrijving", marginX, tabelStartY);
  doc.text("Prijs", colPrijsX, tabelStartY, { align: "right" });
  doc.text("Aantal", colAantalX, tabelStartY, { align: "right" });
  doc.text("BTW%", colBtwPercX, tabelStartY, { align: "right" });
  doc.text("BTW", colBtwX, tabelStartY, { align: "right" });
  doc.text("Totaal", colTotaalX, tabelStartY, { align: "right" });
  doc.setLineWidth(0.5);
  doc.line(marginX, tabelStartY + 2, colTotaalX, tabelStartY + 2);
  doc.setFont("helvetica", "normal");

  // Offerte-items invullen
  let positieY = tabelStartY + 10;
  let subtotaal = 0;
  let btwTotaal = 0;
  let heeftVerlegd = false;
  document.querySelectorAll("#factuur-items tr").forEach(row => {
    const beschrijving = row.querySelector(".beschrijving")?.value || "";
    const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
    const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
    const rijSub = prijs * aantal;
    const btwVal = row.querySelector(".btw")?.value || "21";
    const percNum = btwVal === "verlegd" ? 0 : (parseFloat(btwVal) || 0) / 100;
    const btwBedrag = rijSub * percNum;
    subtotaal += rijSub;
    btwTotaal += btwBedrag;
    if (btwVal === "verlegd") heeftVerlegd = true;

    doc.text(beschrijving, marginX, positieY);
    doc.text(prijs.toFixed(2), colPrijsX, positieY, { align: "right" });
    doc.text(String(aantal), colAantalX, positieY, { align: "right" });
    const rateLabel = (btwVal === "verlegd") ? "verlegd" : `${btwVal}%`;
    doc.text(rateLabel, colBtwPercX, positieY, { align: "right" });
    doc.text(btwBedrag.toFixed(2), colBtwX, positieY, { align: "right" });
    doc.text(rijSub.toFixed(2), colTotaalX, positieY, { align: "right" });
    positieY += 8;
  });

  const totaalBedrag = subtotaal + btwTotaal;
  doc.setFont("helvetica", "bold");
  doc.text("Totaal (EUR):", 140, positieY + 10);
  doc.text(totaalBedrag.toFixed(2), colTotaalX, positieY + 10, { align: "right" });
  if (heeftVerlegd) {
    doc.setFont("helvetica", "italic").setFontSize(10);
    doc.text("BTW verlegd toegepast op bepaalde items", marginX, positieY + 18);
    doc.setFont("helvetica", "normal").setFontSize(12);
  }

  // Slottekst (optioneel)
  doc.setFont("helvetica", "italic").setFontSize(10);
  doc.text(`Deze offerte is geldig tot ${geldigTotStr}.`, marginX, 280);

  // PDF opslaan
  doc.save(`Offerte_${offertenummer || 'export'}.pdf`);
}

