// main.js (CORRECTE VERSIE)
document.addEventListener('DOMContentLoaded', function () {
    // Containers voor desktop en mobiel menu
    const desktopMenuContainer = document.getElementById('menu-container');
    const mobileMenuArea = document.getElementById('mobile-menu-area');
    const menuToggle = document.getElementById('menu-toggle');

    let menuHtmlContent = null; // Houd de menu HTML vast na het fetchen

    function loadMenu() {
        fetch('menu.html') // Zorg dat menu.html in dezelfde map staat of pas pad aan
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok loading menu.html: ' + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                menuHtmlContent = data; // Sla de HTML op
                // Laad initieel in beide containers (desktop is verborgen op mobiel en vice versa)
                if (desktopMenuContainer) {
                     desktopMenuContainer.innerHTML = menuHtmlContent;
                 }
                 if (mobileMenuArea) {
                      // Voeg klassen toe voor mobiele weergave (verborgen standaard)
                      // Belangrijk: wrapper div voor styling en toggle
                      mobileMenuArea.innerHTML = `<div id="mobile-menu-wrapper" class="hidden bg-gray-800 shadow-lg">${menuHtmlContent}</div>`;
                      // Pas stijlen van nav/ul aan binnen mobiel indien nodig
                       const mobileNav = mobileMenuArea.querySelector('nav');
                       if(mobileNav) mobileNav.classList.add('border-t', 'border-gray-700'); // Optionele divider
                  }

                // Initialiseer logica (actieve link) voor beide menu's
                initializeActiveLinkLogic(desktopMenuContainer);
                 initializeActiveLinkLogic(mobileMenuArea); // Zoek binnen mobiele area

                // Koppel mobiele toggle NA het laden
                setupMobileToggle();
            })
            .catch(error => console.error('Fout bij het laden van het menu:', error));
    }

    function setupMobileToggle() {
        const mobileMenuWrapper = mobileMenuArea ? mobileMenuArea.querySelector('#mobile-menu-wrapper') : null;

        if (menuToggle && mobileMenuWrapper) {
            menuToggle.addEventListener('click', function () {
                // Toggle de 'hidden' klasse op de wrapper
                mobileMenuWrapper.classList.toggle('hidden');
            });

             // Optioneel: sluit menu als op een link geklikt wordt op mobiel
             mobileMenuWrapper.querySelectorAll('.nav-link').forEach(link => {
                 link.addEventListener('click', () => {
                     mobileMenuWrapper.classList.add('hidden');
                 });
             });

        } else {
            if (!menuToggle) console.error('Menu toggle button (#menu-toggle) not found.');
            // Let op: mobileMenuArea kan null zijn als het element niet op de pagina staat
            if (mobileMenuArea && !mobileMenuWrapper) console.error('Mobile menu wrapper (#mobile-menu-wrapper) not found inside #mobile-menu-area.');
        }
    }


    function initializeActiveLinkLogic(container) {
        if (!container) return; // Stop als de container niet bestaat

        const links = container.querySelectorAll('.nav-link');

        if (links.length > 0) {
            const currentPage = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);

            links.forEach(link => {
                const linkHref = link.getAttribute('href');
                 // Skip invalid links if any
                 if (!linkHref) return;
                const linkPage = linkHref.split('/').pop();

                // Standaard styling (verwijder actieve stijlen)
                 // Zorg ervoor dat alle mogelijke actieve klassen worden verwijderd
                link.classList.remove('text-green-400', 'font-bold', 'border-b-2', 'border-green-400', 'active', 'bg-gray-700'); // bg-gray-700 voor mobiel?
                link.classList.add('text-white'); // Standaard kleur

                // Nieuwe actieve styling: groene border onderaan en groene tekst
                if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
                    link.classList.add('text-green-400', 'border-b-2', 'border-green-400', 'active'); // Actieve klassen desktop
                    // Optioneel: andere stijl voor mobiel actief item
                     // link.classList.add('bg-gray-700', 'font-semibold'); // Voorbeeld mobiel actief
                    link.classList.remove('text-white'); // Verwijder standaardkleur
                }
            });
        } else {
             // Log alleen als links echt missen waar verwacht
             if (container === desktopMenuContainer || (mobileMenuArea && container === mobileMenuArea.querySelector('#mobile-menu-wrapper'))) {
                  console.warn('No navigation links with class .nav-link found in container:', container);
              }
        }
    }

    // Start het laden van het menu
    loadMenu();

}); // Einde DOMContentLoaded