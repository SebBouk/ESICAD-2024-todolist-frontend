import { Directive } from 'vue';

// Stockage des écouteurs pour chaque élément (optionnel pour nettoyage)
const cleanupMap = new WeakMap<HTMLElement, () => void>();

export const autoResizeDirective: Directive = {
  mounted(el: HTMLInputElement) {
    const adjustWidth = () => {
      // Ajuste la largeur en fonction du texte
      el.style.width = `${el.value.length + 2}ch`; // Ajoutez une marge de 2 caractères
    };

    // Initialisation lors du montage
    adjustWidth();

    // Écouteur pour les changements dans l'input
    el.addEventListener('input', adjustWidth);

    // Ajoute la fonction de nettoyage à la Map
    cleanupMap.set(el, () => el.removeEventListener('input', adjustWidth));
  },
  unmounted(el: HTMLInputElement) {
    // Supprime les écouteurs lors du démontage
    const cleanup = cleanupMap.get(el);
    if (cleanup) cleanup();
    cleanupMap.delete(el); // Nettoie la Map
  }
};
