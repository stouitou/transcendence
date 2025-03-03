// main.ts
import '../css/input.css';
import { createHeader } from './header';
import { createButton } from './button';
import { startGame } from './pong';

document.addEventListener('DOMContentLoaded', () => {
    // Insert the header component at the top of the body.
    const headerElement = createHeader({
        title: 'Plastic Pong Game',
        links: [
            { href: '#game', text: 'Game' },
            { href: '#login', text: 'Log-In' },
            { href: '#info', text: 'Info' }
        ]
    });

    document.body.insertBefore(headerElement, document.body.firstChild);

    const buttonElement = createButton({
        label: 'Launch Game',
        onClick: () => {
            startGame();
        }
    });


    const mainElement = document.querySelector('main');
    if (mainElement) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex justify-center my-6';
        wrapper.appendChild(buttonElement);
        mainElement.insertBefore(wrapper, mainElement.firstChild);
    }
    // Start the game logic.
    //startGame();
});
