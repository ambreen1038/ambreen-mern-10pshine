import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthForm({
  title,
  fields,
  onSubmit,
  footerText,
  footerLink,
  children,
  isLoading,
  submitText
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100 font-inter">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
        {/* Heading */}
        <h2 className="text-center text-gray-800 text-2xl font-semibold mb-8">{title}</h2>

        <form onSubmit={onSubmit}>
          {fields.map((f, i) => (
            <div key={i} className="mb-5">
              <label
                htmlFor={`field-${i}`}
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                {f.label}
              </label>
              <input
                id={`field-${i}`}
                type={f.type}
                className="w-full px-4 py-3 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                value={f.value}
                onChange={f.onChange}
                required
                autoFocus={i === 0}
              />
            </div>
          ))}

          {/* Custom children (e.g., forgot password link) */}
          {children}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {submitText || title}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center mt-6 text-sm text-gray-500">
          {footerText}{' '}
          <Link to={footerLink.href} className="text-blue-600 hover:text-blue-800 font-medium">
            {footerLink.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
