'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api';
import { ChevronRight, MapPin, Clock, Phone, Mail } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://technotronics.mu';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await cmsApi.submitContact(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Techno Tronics Ltd',
            url: siteUrl,
            telephone: '+230-000-0000',
            address: { '@type': 'PostalAddress', addressCountry: 'MU', addressLocality: 'Port Louis' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Contact', item: `${siteUrl}/contact` },
            ],
          }),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">Contact Us</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Get In Touch</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">We'd love to hear from you. Send us a message or visit our showroom.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            {success ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900/30">✓</div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Message Sent!</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Business info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visit Us</h2>
              <div className="flex gap-3 text-sm">
                <MapPin className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">Techno Tronics Ltd</p>
                  <p>Port Louis, Mauritius</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <a href="tel:+2300000000" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  +230 000 0000
                </a>
              </div>
              <div className="flex gap-3 text-sm">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <a href="mailto:info@technotronics.mu" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  info@technotronics.mu
                </a>
              </div>
              <div className="flex gap-3 text-sm">
                <Clock className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-gray-600 dark:text-gray-400">
                  <p>Mon–Fri: 8:30 AM – 6:00 PM</p>
                  <p>Sat: 8:30 AM – 4:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </div>
            </div>

            {/* Map embed */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60070.1!2d57.4!3d-20.16!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDA5JzM2LjAiUyA1N8KwMjQnMDAuMCJF!5e0!3m2!1sen!2smu!4v1"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Techno Tronics location"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
