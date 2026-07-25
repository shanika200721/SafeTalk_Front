import { useEffect, useRef, useState } from 'react';
import { CopyIcon, ExternalLinkIcon, MessageCircleIcon, PhoneIcon, XIcon } from 'lucide-react';
import supportService from '../../services/supportService';

const safeDisplay = (value, fallback = 'Not configured') => value || fallback;

export function SupportContactModal({ open, contact, loading, error, onClose }) {
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const record = async (actionType) => {
    try {
      await supportService.recordAction(actionType, contact?.contact_type);
    } catch (err) {
      console.error('Could not record support action:', err);
    }
  };

  const handleCall = async () => {
    if (!contact?.telephone_uri) return;
    await record('telephone_action_selected');
    window.location.assign(contact.telephone_uri);
  };

  const handleWhatsApp = async () => {
    if (!contact?.whatsapp_uri) return;
    await record('whatsapp_action_selected');
    window.open(contact.whatsapp_uri, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    if (!contact?.display_number) return;
    await navigator.clipboard.writeText(contact.display_number);
    await record('number_copied');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-contact-title"
        aria-describedby="support-contact-description"
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Contact support</p>
            <h2 id="support-contact-title" className="mt-1 text-2xl font-bold text-slate-950">
              {loading ? 'Loading support contact' : safeDisplay(contact?.display_name, 'Support contact unavailable')}
            </h2>
            <p id="support-contact-description" className="mt-1 text-sm text-slate-600">
              SafeTalk does not automatically call, open WhatsApp, or contact anyone for you.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Close support contact dialog"
          >
            <XIcon className="mx-auto h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        {!loading && contact && (
          <>
            <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-700">University or unit</dt>
                <dd className="mt-1 text-slate-900">{safeDisplay(contact.university_name || contact.counseling_unit)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-700">Availability</dt>
                <dd className="mt-1 text-slate-900">{safeDisplay(contact.availability)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-700">Contact hours</dt>
                <dd className="mt-1 text-slate-900">{safeDisplay(contact.available_hours)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="font-semibold text-slate-700">Languages</dt>
                <dd className="mt-1 text-slate-900">
                  {contact.languages?.length ? contact.languages.join(', ') : 'Ask when contact opens'}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <dt className="font-semibold text-slate-700">Office or details</dt>
                <dd className="mt-1 text-slate-900">{safeDisplay(contact.office || contact.display_number)}</dd>
              </div>
            </dl>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleCall}
                disabled={!contact.telephone_available || !contact.telephone_uri}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Call support contact"
              >
                <PhoneIcon className="h-4 w-4" />
                Call
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={!contact.whatsapp_available || !contact.whatsapp_uri}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-teal-700 px-4 py-2 font-semibold text-teal-800 hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
                aria-label="Message support contact on WhatsApp"
              >
                <MessageCircleIcon className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!contact.display_number}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                aria-label="Copy support contact number"
              >
                <CopyIcon className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">Emergency guidance</p>
              <p className="mt-1">
                If there is immediate danger, contact local emergency services or go to the nearest safe emergency
                service. A counselor support number is not an official emergency-service number unless your institution
                verifies it.
              </p>
            </div>

            <ul className="mt-4 space-y-1 text-xs text-slate-500">
              {(contact.limitations || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                <ExternalLinkIcon className="mr-1 inline h-3 w-3" />
                Opening WhatsApp lets you message first; voice calling depends on your device and WhatsApp app.
              </li>
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

export default SupportContactModal;
