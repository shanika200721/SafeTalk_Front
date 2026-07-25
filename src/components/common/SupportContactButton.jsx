import { useRef, useState } from 'react';
import { LifeBuoyIcon } from 'lucide-react';
import SupportContactModal from './SupportContactModal';
import supportService from '../../services/supportService';

export function SupportContactButton() {
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openModal = async () => {
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const selectedContact = await supportService.getContact();
      setContact(selectedContact);
      await supportService.recordAction('support_panel_opened', selectedContact.contact_type);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Support contact is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    window.setTimeout(() => buttonRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={openModal}
        className="fixed bottom-6 right-6 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-teal-700 px-4 py-3 font-semibold text-white shadow-xl transition-colors hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Contact support"
      >
        <LifeBuoyIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Contact Support</span>
      </button>
      <SupportContactModal open={open} contact={contact} loading={loading} error={error} onClose={closeModal} />
    </>
  );
}

export default SupportContactButton;
