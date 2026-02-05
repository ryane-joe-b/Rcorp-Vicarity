import React, { useState } from 'react';
import axios from 'axios';

/**
 * Postcode Lookup Component
 *
 * Uses free postcodes.io API to lookup UK addresses
 * Features:
 * - Real-time postcode validation
 * - Address selection dropdown
 * - Auto-fill address fields
 * - Mobile-optimized
 */

const PostcodeLookup = ({
  postcode,
  onPostcodeChange,
  onAddressSelect,
  error,
  touched,
  onBlur,
}) => {
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Lookup addresses for postcode
  const handleLookup = async () => {
    if (!postcode || postcode.length < 5) {
      setLookupError('Please enter a valid postcode');
      return;
    }

    setLoading(true);
    setLookupError('');

    try {
      const cleanedPostcode = postcode.replace(/\s/g, '');
      const response = await axios.get(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanedPostcode)}`
      );

      if (response.data.status === 200 && response.data.result) {
        const result = response.data.result;

        // Create a structured address object (only include fields we have data for)
        // Note: postcodes.io doesn't provide street addresses, so we don't overwrite those
        const address = {
          city: result.admin_district || result.parish || '',
          county: result.admin_county || result.region || '',
          postcode: result.postcode,
        };

        // Auto-fill what we have (city, county, postcode only)
        onAddressSelect(address);

        // Show info message
        setLookupError('Postcode validated ✓ Please enter your street address below');
      } else {
        setLookupError('Postcode not found. Please check and try again.');
      }
    } catch (err) {
      console.error('Postcode lookup error:', err);
      if (err.response?.status === 404) {
        setLookupError('Postcode not found. Please check and try again.');
      } else {
        setLookupError('Unable to lookup postcode. Please enter address manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  return (
    <div>
      <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
        Postcode *
        <span className="ml-2 text-xs text-gray-500">(We'll help find your address)</span>
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={postcode}
            onChange={(e) => {
              onPostcodeChange(e.target.value.toUpperCase());
              setLookupError('');
            }}
            onBlur={onBlur}
            onKeyPress={handleKeyPress}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all ${
              error && touched
                ? 'border-red-500'
                : postcode && !error
                ? 'border-green-500'
                : 'border-gray-300'
            }`}
            placeholder="SW1A 1AA"
            maxLength={8}
          />
          {postcode && !error && (
            <div className="absolute right-3 top-3.5 text-green-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLookup}
          disabled={loading || !postcode}
          className="min-h-[44px] px-6 py-3 bg-ocean-500 hover:bg-ocean-600 disabled:bg-gray-300
                   text-white font-semibold rounded-lg shadow-lg
                   transition-all hover:scale-105 active:scale-95
                   disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Looking up...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Lookup</span>
            </>
          )}
        </button>
      </div>

      {error && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {lookupError && (
        <p className={`mt-2 text-sm ${lookupError.includes('✓') ? 'text-green-600' : 'text-amber-600'}`}>
          {lookupError}
        </p>
      )}
    </div>
  );
};

export default PostcodeLookup;
