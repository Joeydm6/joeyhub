function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

// ✅ Dummygegevens invullen + totalen direct bijwerken
function vulDummyGegevens() {
    const today = new Date().toISOString().split("T")[0];

    const dummyData = {
        naam: "Jansen Webdesign",
        adres: "Kerkstraat 12",
        postcode: "1234 AB",
        woonplaats: "Amsterdam",
        factuurnummer: "INV-2024001",
        datum: today
    };

    Object.entries(dummyData).forEach(([id, value]) => {
        document.getElementById(id).value = value;
    });

    document.getElementById("factuur-items").innerHTML = `
        <tr>
            <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="Website ontwerp"></td>
            <td><input type="number" class="prijs w-full p-2 text-gray-900" value="500" oninput="berekenTotaal()"></td>
            <td><input type="number" class="aantal w-full p-2 text-gray-900" value="1" oninput="berekenTotaal()"></td>
            <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
        </tr>
        <tr>
            <td><input type="text" class="beschrijving w-full p-2 text-gray-900" value="SEO optimalisatie"></td>
            <td><input type="number" class="prijs w-full p-2 text-gray-900" value="200" oninput="berekenTotaal()"></td>
            <td><input type="number" class="aantal w-full p-2 text-gray-900" value="2" oninput="berekenTotaal()"></td>
            <td><button class="text-red-500 font-bold" onclick="verwijderItem(this)">✖</button></td>
        </tr>
    `;

    setTimeout(berekenTotaal, 100);
}

// ✅ **Bereken het subtotaal, BTW en totaalbedrag correct**
function berekenTotaal() {
    let subtotaal = 0;

    document.querySelectorAll("#factuur-items tr").forEach(row => {
        const prijs = parseFloat(row.querySelector(".prijs")?.value) || 0;
        const aantal = parseInt(row.querySelector(".aantal")?.value) || 0;
        subtotaal += prijs * aantal;
    });

    const btwTotaal = subtotaal * 0.21;
    const totaalBedrag = subtotaal + btwTotaal;

    document.getElementById("subtotaal").innerText = subtotaal.toFixed(2);
    document.getElementById("btw").innerText = btwTotaal.toFixed(2);
    document.getElementById("totaal").innerText = totaalBedrag.toFixed(2);
}

// ✅ Factuur genereren als PDF
function genereerPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const marginX = 20;
    const marginY = 20;
    const bedrijfsInfoX = 140;

    const factuurnummer = document.getElementById("factuurnummer").value || "";
    const factuurDatum = document.getElementById("datum").value;
    const vervaldatum = new Date(factuurDatum);
    vervaldatum.setDate(vervaldatum.getDate() + 30);
    const vervaldatumStr = formatDate(vervaldatum.toISOString().split("T")[0]);

    const totaalBedrag = parseFloat(document.getElementById("totaal").innerText) || 0;

    // ✅ Bedrijfsgegevens
    doc.setFontSize(22).setFont("helvetica", "bold").text("JDM Holding B.V.", marginX, marginY);
    doc.setFontSize(12).text("JDM Holding B.V.", bedrijfsInfoX, marginY);
    doc.setFontSize(10).setFont("helvetica", "normal");
    
    [
        "Vinkenstraat 13", "3136HB Vlaardingen", "joey@klassebv.nl",
        "Tel: 0625300071", "KvK: 80710484", "BTW: NL861770031B01",
        "Bank: NL37 RABO 0370 6868 29"
    ].forEach((text, i) => doc.text(text, bedrijfsInfoX, marginY + 6 + i * 5));

    // ✅ Factuurregels
    let tabelY = 100;
    doc.setFont("helvetica", "bold").text("Omschrijving", marginX, tabelY);
    doc.text("Prijs", 100, tabelY);
    doc.text("Aantal", 130, tabelY);
    doc.text("BTW", 150, tabelY);
    doc.text("Totaal", 180, tabelY);
    doc.line(marginX, tabelY + 2, 190, tabelY + 2);

    let y = tabelY + 10;
    let subtotaal = 0;
    doc.setFont("helvetica", "normal");

    document.querySelectorAll("#factuur-items tr").forEach(row => {
        const [beschrijving, prijsInput, aantalInput] = row.querySelectorAll("input");
        const prijs = parseFloat(prijsInput.value) || 0;
        const aantal = parseInt(aantalInput.value) || 0;
        const totaal = prijs * aantal;
        subtotaal += totaal;

        doc.text(beschrijving.value, marginX, y);
        doc.text(prijs.toFixed(2), 90, y);
        doc.text(aantal.toString(), 120, y);
        doc.text((totaal * 0.21).toFixed(2), 150, y);
        doc.text(totaal.toFixed(2), 180, y);
        y += 10;
    });

    // ✅ Totalen
    const btwTotaal = subtotaal * 0.21;
    doc.setFont("helvetica", "bold").text("Totaal:", 120, y + 20);
    doc.setFont("helvetica", "normal").text(`€ ${totaalBedrag.toFixed(2)}`, 180, y + 20);

    // ✅ Betaalinstructie onderaan
    const betalingY = 280;
    doc.setFontSize(10).setFont("helvetica", "italic").text(
        `We verzoeken u vriendelijk het bovenstaande bedrag van €${totaalBedrag.toFixed(2)} vóór ${vervaldatumStr} te voldoen op onze bankrekening onder vermelding van de omschrijving ${factuurnummer}. Voor vragen kunt u contact opnemen per e-mail.`,
        marginX, betalingY, { maxWidth: 170 }
    );

    doc.save(`Factuur_${factuurnummer}.pdf`);
}

// ✅ Totalen direct bijwerken bij invoerwijziging
document.addEventListener("input", event => {
    if (event.target.classList.contains("prijs") || event.target.classList.contains("aantal")) {
        berekenTotaal();
    }
});
