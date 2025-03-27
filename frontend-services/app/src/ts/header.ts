// header.ts
export interface HeaderLink {
    href: string;
    text: string;
}

export interface HeaderProps {
    title: string;
    links: HeaderLink[];
}

export function createHeader(props: HeaderProps): HTMLElement {
    const header = document.createElement('header');
    header.className = 'bg-white-50 py-5';

    const container = document.createElement('div');
    container.className = 'container mx-auto flex justify-between items-center px-7';

    const titleDiv = document.createElement('div');
    titleDiv.className = `
      text-4xl
      font-archivo
      bg-gradient-to-r  /* Gradient direction: left-to-right */
      from-black
      to-gray-500
      text-transparent  /* Make the text itself transparent */
      bg-clip-text      /* Clip the background to the text shape */
          flex flex-col items-center
    `;

    titleDiv.textContent = props.title;

    const nav = document.createElement('nav');
    nav.className = 'flex space-x-6';
    props.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        a.className = 'text-gray-600 hover:text-gray-900 transition';
        nav.appendChild(a);
    });

    container.appendChild(titleDiv);
    container.appendChild(nav);
    header.appendChild(container);

    return header;
}

