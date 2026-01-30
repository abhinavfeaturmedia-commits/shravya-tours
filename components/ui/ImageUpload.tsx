import React, { useRef } from 'react';

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = "Upload Image", className = "" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Max 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onChange(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{label}</label>}

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                {value ? (
                    <div className="relative group size-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Remove Image"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="size-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 gap-1">
                        <span className="material-symbols-outlined text-2xl">image</span>
                        <span className="text-[10px] font-bold uppercase">No Image</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex-1 pt-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 w-fit"
                        >
                            <span className="material-symbols-outlined text-lg">upload</span>
                            {value ? 'Change Image' : 'Select Image'}
                        </button>
                        <p className="text-[10px] text-slate-400">
                            Supported formats: JPG, PNG, WEBP. Max size: 5MB.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
