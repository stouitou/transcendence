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
    header.className = 'bg-gray-50 border-b border-gray-200 py-6';

    const container = document.createElement('div');
    container.className = 'container mx-auto flex justify-between items-center px-7';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'text-5xl font-semibold';
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

