function formatDate(dateString) {
    if (!dateString) return ""; // Voorkomt fout bij lege datum
    const date = new Date(dateString + "T00:00:00"); // Fix voor inconsistentie in browsers
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function genereerPDF() {
    const jsPDF = window.jspdf.jsPDF; // Fix voor jsPDF module
    const doc = new jsPDF();  // A4 formaat

    // Marges en basisposities
    const marginX = 20;
    const marginY = 20;
    const bedrijfsInfoX = 140;  

    // **Grote, dikke bedrijfsnaam linksboven**
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("JDM Holding B.V.", marginX, marginY);

    // **Bedrijfsgegevens (rechtsboven)**
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("JDM Holding B.V.", bedrijfsInfoX, marginY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const bedrijfsInfoRegels = [
        "Vinkenstraat 13",
        "3136HB Vlaardingen",
        "joey@klassebv.nl",
        "Tel: 0625300071",
        "KvK: 80710484",
        "BTW: NL861770031B01",
        "Bank: NL37 RABO 0370 6868 29"
    ];
    bedrijfsInfoRegels.forEach((regel, idx) => {
        doc.text(regel, bedrijfsInfoX, marginY + 6 + idx * 5);
    });

    // **Klantgegevens (links)**
    const klantNaam = document.getElementById("naam").value || "";
    const klantAdres = document.getElementById("adres").value || "";
    const klantPostcode = document.getElementById("postcode").value || "";
    const klantWoonplaats = document.getElementById("woonplaats").value || "";
    let klantY = 70;
    doc.setFont("helvetica", "normal");
    doc.text(`Naam: ${klantNaam}`, marginX, klantY);
    doc.text(`Adres: ${klantAdres}`, marginX, klantY + 6);
    doc.text(`Postcode: ${klantPostcode}`, marginX, klantY + 12);
    doc.text(`Woonplaats: ${klantWoonplaats}`, marginX, klantY + 18);

    // **Factuurgegevens (rechtsboven naast klant)**
    const factuurnummer = document.getElementById("factuurnummer").value || "";
    const datumInput = document.getElementById("datum").value;
    const factuurDatum = formatDate(datumInput);

    const datumObj = new Date(datumInput + "T00:00:00"); // Fix voor browser compatibiliteit
    datumObj.setDate(datumObj.getDate() + 30);
    const vervaldatumStr = formatDate(datumObj.toISOString().split('T')[0]);

    doc.text(`Factuur: ${factuurnummer}`, bedrijfsInfoX, klantY);
    doc.text(`Datum: ${factuurDatum}`, bedrijfsInfoX, klantY + 6);
    doc.text(`Vervaldatum: ${vervaldatumStr}`, bedrijfsInfoX, klantY + 12);

    // **Tabelkoppen**
    let tabelY = 100;
    doc.setFont("helvetica", "bold");
    doc.text("Omschrijving", marginX, tabelY);
    doc.text("Prijs", 100, tabelY);
    doc.text("Aantal", 130, tabelY);
    doc.text("BTW", 150, tabelY);
    doc.text("Totaal", 180, tabelY);
    doc.setLineWidth(0.5);
    doc.line(marginX, tabelY + 2, 190, tabelY + 2);

    // **Tabelinhoud** (producten/diensten)
    doc.setFont("helvetica", "normal");
    let y = tabelY + 10;
    let subtotaal = 0;
    document.querySelectorAll("#factuur-items tr").forEach(row => {
        const beschrijving = row.cells[0].querySelector("input")?.value || "";
        const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
        const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
        const lijnExcl = prijs * aantal;
        const lijnBTW  = lijnExcl * 0.21;
        const lijnIncl = lijnExcl + lijnBTW;
        subtotaal += lijnExcl;

        doc.text(beschrijving, marginX, y);
        doc.text(prijs.toFixed(2), 90, y);  // Verschuif iets naar rechts
        doc.text(String(aantal), 120, y);  // Extra ruimte
        doc.text(lijnBTW.toFixed(2), 150, y);
        doc.text(lijnIncl.toFixed(2), 180, y);
        
        y += 8;
    });

    // **Totaalbedragen onder de tabel**
    const btwTotaal = subtotaal * 0.21;
    const totaalBedrag = subtotaal + btwTotaal;
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotaal:", 110, y);
    doc.text(`€ ${subtotaal.toFixed(2)}`, 180, y);
    doc.text("21% BTW:", 110, y + 6);
    doc.text(`€ ${btwTotaal.toFixed(2)}`, 180, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text("Totaal:", 110, y + 12);
    doc.text(`€ ${totaalBedrag.toFixed(2)}`, 180, y + 12);

    // **Betaalinstructie onderaan**
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const voetnoot = 
        `Wij verzoeken u vriendelijk het bovenstaande bedrag van € ${totaalBedrag.toFixed(2)} ` +
        `vóór ${vervaldatumStr} te voldoen op onze bankrekening onder vermelding ` +
        `van de omschrijving ${factuurnummer}.`;
    doc.text(voetnoot, marginX, 270, { maxWidth: 170 });

    // **PDF opslaan/downloaden**
    const bestandNaam = factuurnummer ? `Factuur_${factuurnummer}.pdf` : "Factuur.pdf";
    doc.save(bestandNaam);
}
