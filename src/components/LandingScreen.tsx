import { Crosshair, ArrowRightIcon } from "lucide-react";
import { useRef } from "react";

export default function LandingScreen({ handleFileChange }: { handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-row w-full z-20 h-full relative">
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    opacity: 0.5,
                }}
            />
            <div className="absolute top-8 left-8 w-4 h-4 border-l border-t border-[#CCFF00] opacity-80 z-20" />
            <div className="absolute top-8 right-8 w-4 h-4 border-r border-t border-[#CCFF00] opacity-80 z-20" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-l border-b border-[#CCFF00] opacity-80 z-20" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-r border-b border-[#CCFF00] opacity-80 z-20" />
            <div className="w-1/2 px-16 py-16 z-20">
                <div className="mb-4 px-2 py-2 ml-1.5 bg-tbi-900 text-black text-xs font-bold tracking-widest w-max">
                    V.1.0 // SYSTEM READY
                </div>
                <div className="flex flex-col items-start text-white font-sans font-extrabold tracking-tighter text-6xl md:text-8xl lg:text-9xl">
                    <p>DEPTH</p>
                    <p className="text-transparent stroke-text" style={{ WebkitTextStroke: '2px #333' }}>EFFECT</p>
                    <p>EDITOR.</p>
                </div>
                <p className="mt-6 text-lg text-gray-500 ml-1.5 font-mono border-l-2 border-tbi-900 pl-4">
                    <span>Text Behind Image</span>
                    <br />
                    <span className="text-gray-400">Zero data upload. Client-side processing.</span>
                </p>
            </div>
            <div className="w-1/2 h-full flex items-center relative z-20">
                <img src="src/assets/mv33.png" alt="mv33" className="w-[25vw] border border-tbi-900 h-[75vh] object-fit" />
                <div className="w-1/2 h-fit flex absolute bottom-16 right-24 flex-col gap-4 border border-gray-400 hover:border-[#CCFF00] p-4 bg-tbi-800 group">
                    <div className="flex flex-row items-center justify-between">
                        <p className="text-gray-400 font-mono">INPUT SOURCE</p>
                        <Crosshair className="w-5 h-5 text-gray-400 group-hover:text-[#CCFF00]" strokeWidth={3} />
                    </div>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-row bg-tbi-900 items-center justify-center h-[8vh] hover:bg-white hover:h-[10vh] transition-all duration-300 cursor-pointer"
                    >
                        <p className="text-black font-bold text-xl font-mono px-2 py-2">UPLOAD IMAGE</p>
                        <ArrowRightIcon className="w-5 h-5" strokeWidth={3} stroke="black" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>
        </div>
    );
}