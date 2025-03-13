// factuur.js

// Hulpfunctie om datum in DD/MM/JJJJ formaat te tonen
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth()+1).padStart(2, "0")}/${date.getFullYear()}`;
}

// Dummygegevens invoegen in formulier
function vulDummyGegevens() {
  const today = new Date().toISOString().split("T")[0]; // vandaag als YYYY-MM-DD
  const dummyData = {
    naam: "Jansen Webdesign",
    adres: "Kerkstraat 12",
    postcode: "1234 AB",
    woonplaats: "Amsterdam",
    factuurnummer: "INV-2024001",
    datum: today
  };
  // Vul elk corresponderend veld
  for (const [id, value] of Object.entries(dummyData)) {
    const input = document.getElementById(id);
    if (input) input.value = value;
  }
  // Voeg voorbeeld factuurregels toe
  document.getElementById("factuur-items").innerHTML = `
    <tr>
      <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="Website ontwerp" /></td>
      <td><input type="number" class="prijs w-full p-2 text-gray-900" value="500" oninput="berekenTotaal()" /></td>
      <td><input type="number" class="aantal w-full p-2 text-gray-900" value="1" oninput="berekenTotaal()" /></td>
      <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
    </tr>
    <tr>
      <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="SEO optimalisatie" /></td>
      <td><input type="number" class="prijs w-full p-2 text-gray-900" value="200" oninput="berekenTotaal()" /></td>
      <td><input type="number" class="aantal w-full p-2 text-gray-900" value="2" oninput="berekenTotaal()" /></td>
      <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
    </tr>
  `;
  berekenTotaal(); // update totalen meteen
}

// Voeg lege factuurregel toe
function voegItemToe() {
  const tbody = document.getElementById("factuur-items");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="beschrijving w-full p-2 text-gray-900" oninput="berekenTotaal()" /></td>
    <td><input type="number" class="prijs w-full p-2 text-gray-900" value="0" oninput="berekenTotaal()" /></td>
    <td><input type="number" class="aantal w-full p-2 text-gray-900" value="1" oninput="berekenTotaal()" /></td>
    <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
  `;
  tbody.appendChild(row);
}

// Verwijder een specifieke factuurregel (aangeroepen vanuit de ✖ knop)
function verwijderItem(button) {
  const row = button.closest("tr");
  if (row) {
    row.remove();
    berekenTotaal();
  }
}

// Bereken subtotaal, BTW en totaal op basis van ingevulde regels
function berekenTotaal() {
  let subtotaal = 0;
  document.querySelectorAll("#factuur-items tr").forEach(row => {
    const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
    const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
    subtotaal += prijs * aantal;
  });
  const btwBedrag = subtotaal * 0.21;
  const totaalBedrag = subtotaal + btwBedrag;
  document.getElementById("subtotaal").innerText = subtotaal.toFixed(2);
  document.getElementById("btw").innerText = btwBedrag.toFixed(2);
  document.getElementById("totaal").innerText = totaalBedrag.toFixed(2);
}

// Genereer de factuur als PDF met behulp van jsPDF
function genereerPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const marginX = 20, marginY = 20;
  const bedrijfsInfoX = 140;

  // Ingevoerde factuurgegevens
  const factuurnummer = document.getElementById("factuurnummer").value || "";
  const factuurDatum = document.getElementById("datum").value; 
  // Vervaldatum = 30 dagen na factuurdatum
  let vervalDatumStr = "";
  if (factuurDatum) {
    const verval = new Date(factuurDatum);
    verval.setDate(verval.getDate() + 30);
    vervalDatumStr = formatDate(verval.toISOString().split("T")[0]);
  }

  // Bedrijfsnaam als kop
  doc.setFont("helvetica", "bold").setFontSize(22);
  doc.text("JDM Holding B.V.", marginX, marginY);
  doc.setFontSize(12);

  // Factuurgegevens (nummer, data)
  doc.text(`Factuurnummer: ${factuurnummer}`, marginX, marginY + 10);
  doc.text(`Factuurdatum: ${formatDate(factuurDatum)}`, marginX, marginY + 16);
  doc.text(`Vervaldatum: ${vervalDatumStr}`, marginX, marginY + 22);

  // 🏷️ **Klantgegevens invoegen in het vak linksboven**
  const klantNaam = document.getElementById("naam").value || "Klantnaam";
  const klantAdres = document.getElementById("adres").value || "Adres";
  const klantPostcode = document.getElementById("postcode").value || "Postcode";
  const klantWoonplaats = document.getElementById("woonplaats").value || "Woonplaats";

  doc.setFont("helvetica", "normal").setFontSize(12);
  doc.text(klantNaam, marginX, marginY + 42);
  doc.text(klantAdres, marginX, marginY + 49);
  doc.text(`${klantPostcode} ${klantWoonplaats}`, marginX, marginY + 56);

  // 📍 **Bedrijfsadres en info rechtsboven**
  doc.setFont("helvetica", "normal").setFontSize(10);
  const bedrijfsInfoRegels = [
    "JDM Holding B.V.", "Vinkenstraat 13", "3136 HB Vlaardingen", 
    "joey@klassebv.nl", "Tel: 0625300071", "KvK: 80710484", "BTW: NL861770031B01", 
    "Bank: NL37 RABO 0370 6868 29"
  ];
  bedrijfsInfoRegels.forEach((text, i) => {
    doc.text(text, bedrijfsInfoX, marginY + i * 5);
  });

  // Tabelkop voor factuurregels
  let tabelStartY = 100;
  doc.setFont("helvetica", "bold");
  doc.text("Omschrijving", marginX, tabelStartY);
  doc.text("Prijs", 100, tabelStartY);
  doc.text("Aantal", 130, tabelStartY);
  doc.text("BTW", 155, tabelStartY);
  doc.text("Totaal", 180, tabelStartY);
  doc.setLineWidth(0.5);
  doc.line(marginX, tabelStartY + 2, 200, tabelStartY + 2);
  doc.setFont("helvetica", "normal");

  // Factuurregels invullen
  let positieY = tabelStartY + 10;
  let subtotaal = 0;
  document.querySelectorAll("#factuur-items tr").forEach(row => {
    const beschrijving = row.querySelector(".beschrijving")?.value || "";
    const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
    const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
    const totaal = prijs * aantal;
    subtotaal += totaal;
    // Regel invullen
    doc.text(beschrijving, marginX, positieY);
    doc.text(prijs.toFixed(2), 90, positieY, { align: "right" });
    doc.text(String(aantal), 130, positieY, { align: "right" });
    doc.text((totaal * 0.21).toFixed(2), 155, positieY, { align: "right" });
    doc.text(totaal.toFixed(2), 200, positieY, { align: "right" });
    positieY += 8;
  });

  // Totaalbedragen onder de tabel
  const btwTotaal = subtotaal * 0.21;
  const totaalBedrag = subtotaal + btwTotaal;
  doc.setFont("helvetica", "bold");
  doc.text("Totaal (EUR):", 140, positieY + 10);
  doc.text(totaalBedrag.toFixed(2), 200, positieY + 10, { align: "right" });

  // Betaalinstructie onderaan
  doc.setFont("helvetica", "italic").setFontSize(10);
  doc.text(`Gelieve het totaalbedrag van €${totaalBedrag.toFixed(2)} vóór ${vervalDatumStr} te voldoen.`, marginX, 280);

  // PDF opslaan
  doc.save(`Factuur_${factuurnummer || 'export'}.pdf`);
}
