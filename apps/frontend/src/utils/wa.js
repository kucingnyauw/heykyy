/**
 * Generate WhatsApp link with prefilled message.
 * @param {string} phone
 * @param {string} [message]
 * @returns {string}
 */
export const buildWhatsAppLink = (phone, message) => {
    const cleanNumber = phone?.replace(/[^0-9]/g, "") || "";
  
    const defaultMessage =
      "Hi Rifky, I visited your portfolio and I'm interested in discussing a potential project/collaboration with you.";
  
    const text = encodeURIComponent(message || defaultMessage);
  
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };