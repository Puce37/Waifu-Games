document.addEventListener('DOMContentLoaded', () => {
    // Création dynamique de l'overlay du portail si absent
    let portal = document.getElementById('portal-overlay');
    if (!portal) {
        portal = document.createElement('div');
        portal.id = 'portal-overlay';
        document.body.appendChild(portal);
    }

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.href;

            // Récupération des variables CSS sur la carte
            const color = this.style.getPropertyValue('--portal-color') || '#ffffff';
            const filter = this.style.getPropertyValue('--portal-filter') || 'none';

            // Activation du portail image avec ses styles
            if (portal) {
                portal.style.filter = filter;
                portal.style.boxShadow = `0 0 60px ${color}`;
                portal.classList.add('active');
            }

            // Redirection après l'animation (700ms pour matcher le CSS)
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 700);
        });
    });
});