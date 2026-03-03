import React, { useRef } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 500 * 1024; // 500 KB

export default function ImageUpload({ label, value, onChange, placeholder }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG/JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const sizeKB = Math.round(file.size / 1024);
      alert(`Image is too large (${sizeKB} KB). Maximum size is 500 KB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {value ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'contain',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => inputRef.current && inputRef.current.click()}
            >
              🔄 Replace
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleRemove}>
              🗑️ Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f9fafb',
          }}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
          <div className="text-sm text-muted">{placeholder || 'Click to upload image'}</div>
          <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            JPG, PNG, WEBP · Max 500 KB
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
