'use client';

import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function TestConfigPage() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const checkConfig = () => {
      const configured = isSupabaseConfigured();
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      setConfig({
        configured,
        urlLength: url.length,
        keyLength: key.length,
        urlPreview: url.substring(0, 50),
        urlValid: url.startsWith('https://') && url.includes('.supabase.co'),
        keyValid: key.length > 20,
      });
    };

    checkConfig();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase Configuration Test</h1>
        
        {config ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold mb-2">Configuration Status</h2>
              <p className={`text-lg ${config.configured ? 'text-green-600' : 'text-red-600'}`}>
                {config.configured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold mb-2">Details</h2>
              <ul className="space-y-2 text-sm">
                <li>URL Valid: {config.urlValid ? '✅' : '❌'} ({config.urlLength} chars)</li>
                <li>Key Valid: {config.keyValid ? '✅' : '❌'} ({config.keyLength} chars)</li>
                <li>URL Preview: {config.urlPreview || '(empty)'}</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h2 className="font-semibold mb-2">⚠️ Troubleshooting</h2>
              {!config.configured && (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {!config.urlValid && <li>URL is invalid or empty</li>}
                  {!config.keyValid && <li>Anon Key is invalid or empty (needs &gt;20 chars)</li>}
                  <li>Make sure .env.local exists in project root</li>
                  <li>Restart dev server after .env changes</li>
                </ul>
              )}
              {config.configured && (
                <p className="text-sm text-green-700">
                  ✅ All checks passed! Google OAuth should work if provider is enabled in Supabase.
                </p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold mb-2">Raw Data (for debugging)</h2>
              <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}

        <div className="mt-6">
          <a 
            href="/auth" 
            className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            ← Back to Auth Page
          </a>
        </div>
      </div>
    </div>
  );
}
