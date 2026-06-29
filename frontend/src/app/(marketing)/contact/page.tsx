'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Mail, GitFork, Send } from 'lucide-react';

const CHANNELS = [
  { icon: Mail,          label: 'Email',    value: 'hello@metaaras.io',      color: '#6366f1' },
  { icon: MessageCircle, label: 'Telegram', value: 't.me/metaaras',          color: '#22d3ee' },
  { icon: GitFork,       label: 'GitHub',   value: 'github.com/metaaras',    color: '#a78bfa' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1200);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <Badge variant="brand" className="mb-4">Get In Touch</Badge>
        <h1 className="text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Contact <span className="gradient-text">Us</span>
        </h1>
        <p className="text-[var(--text-secondary)]">
          Have questions about the protocol? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">Message sent!</h3>
              <p className="text-sm text-[var(--text-secondary)]">We&apos;ll get back to you within 24 hours.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Name</label>
                <input
                  id="contact-name"
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email</label>
                <input
                  id="contact-email"
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Subject</label>
                <select id="contact-subject" className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                  <option>Security Vulnerability</option>
                  <option>Investment</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Describe your question or message..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
              </div>
              <Button type="submit" fullWidth loading={loading}>
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </form>
          )}
        </Card>

        {/* Channels */}
        <div className="space-y-4">
          {CHANNELS.map(ch => (
            <Card key={ch.label} glow className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${ch.color}20` }}
              >
                <ch.icon className="w-5 h-5" style={{ color: ch.color }} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{ch.label}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{ch.value}</p>
              </div>
            </Card>
          ))}

          <Card className="mt-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Security Reports</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Please report security vulnerabilities to{' '}
              <span className="text-brand-400">security@metaaras.io</span>{' '}
              with a detailed description. We respond within 24 hours and offer responsible disclosure
              rewards through our bug bounty program.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
