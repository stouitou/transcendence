export interface ButtonProps {
    label: string;
    onClick?: () => void;
    // You can add more properties like icon, styles, or even children for composite design.
}

export function createButton(props: ButtonProps): HTMLElement {
    // Create the button element
    const button = document.createElement('button');

    // Set the button text
    button.textContent = props.label;

    // Apply a base class (you can change or extend this as needed)
    button.className = `
      bg-gradient-to-r 
      from-blue-400 
      to-red-500 
      hover:from-green-500 
      hover:to-blue-600 
      text-white 
      font-bold 
      py-2 
      px-4 
      rounded-full 
      shadow-lg 
      transition 
      duration-200
`;

    // If an onClick function is provided, attach it to the click event.
    if (props.onClick) {
        button.addEventListener('click', props.onClick);
    }

    // === HINT: Composite Approach ===
    // If you want to add extra elements (like an icon or nested content), create and append them here.
    // For example, you might do something like:
    //
    // const icon = document.createElement('span');
    // icon.className = 'btn-icon';
    // icon.textContent = '⭐';
    // button.insertBefore(icon, button.firstChild);
    //
    // Experiment with inserting additional elements inside your button.

    return button;
}
