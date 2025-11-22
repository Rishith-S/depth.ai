import { Layers, Upload, ArrowLeft } from "lucide-react";
import { useRef } from "react";

interface NavbarProps {
    uploadFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    hasImage?: boolean;
    onReset?: () => void;
}

export default function Navbar({ uploadFile, hasImage, onReset }: NavbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex items-center justify-between border-b border-gray-700 select-none">
            <div className="flex items-center gap-2 p-4">
                <Layers className="w-6 h-6 bg-tbi-900 p-1" stroke="black" />
                <div>
                    <p className="font-mono font-bold text-xl text-tbi-900">Depth.ai</p>
                </div>
            </div>
            <div className="p-4">
                {hasImage ? (
                    <button onClick={onReset} className="bg-white text-black px-4 py-2 flex items-center gap-2 font-mono text-md select-none hover:bg-gray-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <p>Back to Home</p>
                    </button>
                ) : (
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-4 py-2 flex items-center gap-2 font-mono text-md select-none hover:bg-gray-200 transition-colors">
                        <Upload className="w-3 h-3" stroke="black" />
                        <p>Upload Image</p>
                    </button>
                )}
                <input type="file" onChange={uploadFile} ref={fileInputRef} className="hidden" accept="image/*" />
            </div>
        </div>
    );
}