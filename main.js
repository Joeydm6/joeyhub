// main.js
document.addEventListener('DOMContentLoaded', function () {
    const menuContainer = document.getElementById('menu-container');
    const menuToggle = document.getElementById('menu-toggle'); // Knop moet in de hoofd HTML staan

    // 1. Menu laden via fetch
    if (menuContainer) {
        fetch('menu.html') // Zorg dat menu.html in dezelfde map staat of pas pad aan
            .then(response => {
                if (!response.ok) {
                    // Gooi een error als het bestand niet gevonden wordt etc.
                    throw new Error('Network response was not ok loading menu.html: ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                menuContainer.innerHTML = data;
                // Nadat menu geladen is, voer menu logica uit
                initializeMenuLogic();
            })
            .catch(error => console.error('Fout bij het laden van het menu:', error));
    } else {
         // Fallback of error als container niet gevonden wordt
         console.error('Menu container element (#menu-container) not found in this HTML page.');
         // Probeer toch menu logica te initialiseren voor het geval er een hardcoded menu is
         initializeMenuLogic();
    }

    // Functie voor menu logica (toggle en active link)
    function initializeMenuLogic() {
        // Zoek menu en links BINNEN de container (als die bestaat) of anders in het document
        const menuElement = menuContainer ? menuContainer.querySelector('#menu') : document.getElementById('menu');
        const links = menuContainer ? menuContainer.querySelectorAll('.nav-link') : document.querySelectorAll('.nav-link');

        // 2. Toggle menu voor mobiel
        if (menuToggle && menuElement) {
            menuToggle.addEventListener('click', function () {
                menuElement.classList.toggle('hidden'); // Gebruik Tailwind's 'hidden' klasse
            });
        } else {
            // Log errors als elementen niet gevonden worden na het laden/in fallback
            if (!menuToggle) console.error('Menu toggle button (#menu-toggle) not found in this HTML page.');
            if (!menuElement) console.error('Menu element (#menu) not found after attempting to load or in fallback.');
        }

        // 3. Actieve pagina markeren
        if (links.length > 0) {
            // Huidige bestandsnaam (bv. "index.html", "contact.html")
            // window.location.pathname geeft bijv. "/contact.html" of "/folder/contact.html"
            // We nemen het deel na de laatste '/'
            const currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);

            links.forEach(link => {
                // Bestandsnaam uit de href van de link
                const linkPage = link.getAttribute('href').substring(link.getAttribute('href').lastIndexOf('/') + 1);

                // Verwijder eerst eventuele bestaande active classes/styles
                link.classList.remove('text-green-400', 'font-bold', 'active');
                link.classList.add('text-white'); // Zorg dat standaard kleur (of de basis Tailwind klasse) actief is

                // Markeer als actief als bestandsnamen overeenkomen
                // Speciale check voor root ('/' of '') -> index.html
                if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                    link.classList.add('text-green-400', 'font-bold', 'active'); // Voeg Tailwind classes en/of 'active' class toe
                    link.classList.remove('text-white'); // Verwijder basiskleur indien nodig
                }
            });
        } else {
             // Log error als er geen links gevonden zijn
             console.error('No navigation links with class .nav-link found after attempting to load menu or in fallback.');
        }
    }
});