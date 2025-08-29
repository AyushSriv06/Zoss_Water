import React, { useState } from "react";


const chatMessages = [
  `369 ZossWater Products Private Limited\nHi There! Welcome to Zoss Water, your one-stop destination for alkaline ionized water machines, wastewater treatment, and all water solutions!`,
  `We are dedicated to providing you with the best quality water solutions to meet your specific needs. Whether you're looking for a water treatment system for your home or business, or a top-of-the-line alkaline ionized water machine, we've got you covered.\n\nOur team of experts is here to help you make informed decisions about your water treatment needs. Don't hesitate to reach out to us with any questions or concerns you may have.\n\nWe take pride in offering sustainable and innovative solutions for our customers. By investing in our products, you'll be making a commitment to a healthier and more sustainable lifestyle.\n\nThank you for choosing Zoss Water. We look forward to serving you and providing you with the best water solutions on the market.\n\nRegards\nZoss\nCustomer Delight Team`
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.phone.trim()) errs.phone = "Phone is required.";
    if (!form.message.trim()) errs.message = "Message is required.";
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
    setUserMessage(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nMessage: ${form.message}`
    );
    // Here you can add API call logic
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-zoss-blue text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:bg-zoss-green transition"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat bot"
      >
        💬
      </button>
      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in"
          style={{
            width: '350px',
            maxWidth: '95vw',
            maxHeight: '80vh',
            minWidth: '260px',
            display: 'flex',
          }}
        >
          <div className="bg-zoss-blue text-white px-4 py-3 flex items-center justify-between rounded-t-3xl">
            <span className="font-bold tracking-wide">Zoss Water</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">×</button>
          </div>
          <div
            className="flex flex-col gap-2 px-4 py-4 bg-gradient-to-b from-yellow-50 to-yellow-100 border-b border-gray-200"
            style={{ minHeight: 100, maxHeight: 180, overflowY: 'auto' }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-line max-w-[90%] ${i === 0 ? 'self-start bg-yellow-200 text-gray-800 shadow' : 'self-start bg-white border border-yellow-200 text-gray-700 shadow-sm'}`}
                style={{ marginBottom: i === chatMessages.length - 1 ? 0 : 4 }}
              >
                {msg}
              </div>
            ))}
            {userMessage && (
              <div className="self-end bg-zoss-blue text-white rounded-xl px-3 py-2 text-sm whitespace-pre-line max-w-[90%] shadow">
                {userMessage}
              </div>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {!submitted ? (
              <form className="p-4 space-y-3 bg-white" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zoss-blue bg-gray-50"
                    required
                  />
                  {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zoss-blue bg-gray-50"
                    required
                  />
                  {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zoss-blue bg-gray-50"
                    required
                  />
                  {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zoss-blue bg-gray-50"
                    rows={3}
                    required
                  />
                  {errors.message && <div className="text-xs text-red-500 mt-1">{errors.message}</div>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-zoss-blue hover:bg-zoss-green text-white font-semibold py-2 rounded-lg transition text-base shadow"
                  disabled={submitted}
                >
                  Submit
                </button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
