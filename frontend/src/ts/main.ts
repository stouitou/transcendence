import '../css/input.css';
import { createHeader } from './header';
import { createButton } from './button';
import { startGame } from './pong';
import { router } from './router';

document.addEventListener('DOMContentLoaded', () => {
    // Insert the header component.
    const headerElement = createHeader({
        title: 'Plastic Pong Game',
        links: [
            { href: '#game', text: 'Game' },
            { href: '#login', text: 'Log-In' },
            { href: '#info', text: 'Info' }
        ]
    });
    document.body.insertBefore(headerElement, document.body.firstChild);

    // Initialize routing on first load.
    router();

    // Listen for hash changes to update the view.
    window.addEventListener('hashchange', router);
});