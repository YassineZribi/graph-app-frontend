import { Modal } from 'bootstrap'

// Function to show the confirmation modal
export function showConfirmationModal(message, confirmCallback, options = {confirmButton: {className: "btn-danger", textContent: "Confirmer"}}) {
    const modalMessageElement = document.getElementById('confirmationModalMessage');
    const confirmButton = document.getElementById('confirmationModalConfirmButton');

    // Set the modal message
    modalMessageElement.textContent = message;

    if (options.confirmButton) {
        confirmButton.classList.add(options.confirmButton.className)
        confirmButton.innerHTML = options.confirmButton.textContent
    }

    // Remove any previous click event from the confirm button
    confirmButton.onclick = null;

    // Add the new confirm callback
    confirmButton.onclick = async function () {

        const confirmButtonOriginalContent = confirmButton.innerHTML;
        const confirmButtonOriginalWidth = getComputedStyle(confirmButton).width
        // Disable the button and show spinner
        confirmButton.disabled = true;
        confirmButton.style.width = confirmButtonOriginalWidth
        confirmButton.innerHTML = `
          <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        `;

        try {
            const result = await confirmCallback();
            if (result) {
                // Close the modal if the callback succeeds
                const modal = Modal.getInstance(document.getElementById('confirmationModal'));
                modal.hide();
            } else {
                alert('Action failed. Please try again.');
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
        } finally {
            // Revert button to original state
            confirmButton.disabled = false;
            confirmButton.style.removeProperty("width")
            confirmButton.innerHTML = confirmButtonOriginalContent;
          }
    };

    // Show the modal
    const confirmationModal = new Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();
}