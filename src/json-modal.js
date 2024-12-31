import { Modal } from 'bootstrap'
import 'pretty-print-json/css/pretty-print-json.min.css'

// Function to show the json modal
export function showJsonModal(title, message) {
    const modalTitleElement = document.getElementById('jsonModalLabel');
    const modalJsonPreElement = document.getElementById('json-pre');

    // Set the modal title
    modalTitleElement.textContent = title;

    // Set the modal message
    modalJsonPreElement.innerHTML = message;

    // Show the modal
    const jsonModal = new Modal(document.getElementById('jsonModal'));
    jsonModal.show();
}