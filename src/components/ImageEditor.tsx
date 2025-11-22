import { useRef, useEffect } from "react";
import { PlusIcon, ChevronDownIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";

export default function ImageEditor({ url, bgUrl }: { url: string, bgUrl: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleDownload = async () => {
        if (!imageRef.current || !url || !bgUrl) return;

        const img = imageRef.current;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const displayWidth = img.width;
        const scale = naturalWidth / displayWidth;

        const canvas = document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Helper to load image
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const i = new Image();
                i.crossOrigin = "anonymous";
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = src;
            });
        };

        try {
            // 1. Draw Background
            const bgImage = await loadImage(bgUrl);
            ctx.drawImage(bgImage, 0, 0, naturalWidth, naturalHeight);

            // 2. Draw Text Layers
            layers.forEach(layer => {
                ctx.save();

                // Calculate position in pixels
                const x = (layer.x / 100) * naturalWidth;
                const y = (layer.y / 100) * naturalHeight;

                // Move to position
                ctx.translate(x, y);
                ctx.rotate((layer.rotation * Math.PI) / 180);

                // Configure text styles
                const scaledFontSize = layer.fontSize * scale;
                ctx.font = `${layer.fontWeight} ${scaledFontSize}px ${layer.fontFamily}`;
                ctx.fillStyle = layer.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Shadow
                if (layer.shadowColor && layer.shadowBlur > 0) {
                    ctx.shadowColor = layer.shadowColor;
                    ctx.shadowBlur = layer.shadowBlur * scale;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                ctx.fillText(layer.text, 0, 0);
                ctx.restore();
            });

            // 3. Draw Foreground
            const fgImage = await loadImage(url);
            ctx.drawImage(fgImage, 0, 0, naturalWidth, naturalHeight);

            // 4. Download
            const link = document.createElement('a');
            link.download = `edited-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate download", err);
        }
    };

    useEffect(() => {
        if (!url) return;
        const img = new Image();
        img.src = url;

        img.onload = () => {
            console.log(img.width, img.height);
        };

        img.onerror = (err) => {
            console.error("Image loading error:", err);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [url]);
    const [layers, setLayers] = useState<TextLayer[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<TextLayer | null>(null);
    const onUpdateLayer = (updates: Partial<TextLayer>) => {
        if (!selectedLayer) return;

        let newX = updates.x !== undefined ? updates.x : selectedLayer.x;
        let newY = updates.y !== undefined ? updates.y : selectedLayer.y;

        // Clamp to 0-100%
        if (updates.x !== undefined) {
            newX = Math.max(0, Math.min(newX, 100));
        }
        if (updates.y !== undefined) {
            newY = Math.max(0, Math.min(newY, 100));
        }

        const updatedLayer = { ...selectedLayer, ...updates, x: newX, y: newY };

        setSelectedLayer(updatedLayer);
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === selectedLayer.id ? updatedLayer : layer
            )
        );
    };
    const onAddLayer = () => {
        const newLayer: TextLayer = {
            id: Date.now().toString(),
            text: "New Text",
            x: 50,
            y: 50,
            fontSize: 100,
            fontFamily: "Arial",
            fontWeight: 700,
            color: "#FFFFFF",
            opacity: 1,
            shadowColor: "#000000",
            shadowBlur: 0,
            rotation: 0,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayer(newLayer);
    };
    const onRemoveLayer = (id: string) => {
        setLayers((prev) => prev.filter((layer) => layer.id !== id));
        if (selectedLayer?.id === id) {
            setSelectedLayer(null);
        }
    };
    const onSelectLayer = (id: string) => {
        const layer = layers.find((layer) => layer.id === id);
        if (layer) {
            setSelectedLayer(layer);
        }
    };
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        onSelectLayer(id);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !selectedLayer || !dragStart || !containerRef.current) return;

        e.preventDefault();

        const imageContainer = containerRef.current.querySelector('.relative.inline-block');
        if (!imageContainer) return;

        const rect = imageContainer.getBoundingClientRect();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;

        onUpdateLayer({
            x: selectedLayer.x + deltaXPercent,
            y: selectedLayer.y + deltaYPercent
        });
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <ControlPanel
                selectedLayer={selectedLayer}
                onUpdateLayer={onUpdateLayer}
                onAddLayer={onAddLayer}
                onRemoveLayer={onRemoveLayer}
                layers={layers}
                onSelectLayer={onSelectLayer}
                onDownload={handleDownload}
            />
            <div className="relative w-full h-[50vh] md:h-full md:flex-1 flex items-center justify-center bg-gray-900/50 overflow-hidden p-4 md:p-8">
                <div className="relative inline-block max-w-full max-h-full">
                    <img ref={imageRef} src={url} alt="foreground" className="max-w-full max-h-full object-contain opacity-0 pointer-events-none relative z-20" style={{ maxHeight: 'calc(100vh - 200px)' }} />
                    <img src={bgUrl} alt="background" className="absolute top-0 left-0 w-full h-full object-contain z-0" />

                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            onPointerDown={(e) => handlePointerDown(e, layer.id)}
                            style={{
                                position: 'absolute',
                                left: `${layer.x}%`,
                                top: `${layer.y}%`,
                                fontSize: `${layer.fontSize}px`,
                                fontFamily: layer.fontFamily,
                                fontWeight: layer.fontWeight,
                                color: layer.color,
                                opacity: layer.opacity,
                                textShadow: `${layer.shadowColor} 0px 0px ${layer.shadowBlur}px`,
                                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                                cursor: isDragging && selectedLayer?.id === layer.id ? 'grabbing' : 'grab',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                touchAction: 'none'
                            }}
                            className="z-10"
                        >
                            <div>
                                {layer.text}
                            </div>
                        </div>
                    ))}
                    <img src={url} alt="foreground" className="absolute top-0 left-0 w-full h-full object-contain z-30 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

interface TextLayer {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    color: string;
    opacity: number;
    shadowColor: string;
    shadowBlur: number;
    rotation: number;
}

interface ControlPanelProps {
    selectedLayer: TextLayer | null;
    onUpdateLayer: (updates: Partial<TextLayer>) => void;
    onAddLayer: () => void;
    onRemoveLayer: (id: string) => void;
    layers: TextLayer[];
    onSelectLayer: (id: string) => void;
    onDownload: () => void;
}


const FONT_FAMILIES = [
    "Arial",
    "Verdana",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact"
];

function ControlPanel({ selectedLayer,
    onUpdateLayer,
    onAddLayer,
    onRemoveLayer,
    layers,
    onSelectLayer,
    onDownload,
}: ControlPanelProps) {
    const [isLayersOpen, setIsLayersOpen] = useState(false);
    const [isFontOpen, setIsFontOpen] = useState(false);

    return (
        <div className="w-full md:w-[400px] md:min-w-[400px] h-[40vh] md:h-full p-4 border-b md:border-r md:border-b-0 border-tbi-900 flex flex-col gap-4 relative z-20 bg-black/80 backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col gap-4 items-center justify-center shrink-0">
                <div onClick={onAddLayer} className="flex flex-row items-center gap-2 h-[6vh] justify-center w-3/4 bg-tbi-900 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer shadow-lg shadow-tbi-900/20">
                    <PlusIcon className="w-5 h-5" stroke="black" strokeWidth={3} />
                    <p className="font-bold text-xl font-mono px-2 py-2 text-black">Add Text</p>
                </div>
                <div onClick={onDownload} className="flex flex-row items-center gap-2 h-[6vh] justify-center w-3/4 bg-white hover:bg-tbi-900 transition-all duration-300 cursor-pointer shadow-lg">
                    <DownloadIcon className="w-5 h-5" stroke="black" strokeWidth={3} />
                    <p className="text-black font-bold text-xl font-mono px-2 py-2">Download</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 relative">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider opacity-70 mb-1">Layers</h3>

                <div
                    onClick={() => setIsLayersOpen(!isLayersOpen)}
                    className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded-md flex justify-between items-center cursor-pointer hover:border-tbi-900 transition-colors"
                >
                    <span className="text-white truncate">
                        {selectedLayer ? (selectedLayer.text || "Empty Text") : "Select a Layer"}
                    </span>
                    <ChevronDownIcon
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isLayersOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {isLayersOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-xl z-50 max-h-[20vh] overflow-y-auto">
                        {layers.length === 0 && <div className="p-3 text-gray-500 text-sm italic">No layers added</div>}
                        {layers.map((layer) => (
                            <div
                                key={layer.id}
                                onClick={() => {
                                    onSelectLayer(layer.id);
                                    setIsLayersOpen(false);
                                }}
                                className={`p-3 cursor-pointer flex justify-between items-center hover:bg-gray-800 transition-colors ${selectedLayer?.id === layer.id
                                    ? 'bg-tbi-900/10 text-tbi-900'
                                    : 'text-gray-300'
                                    }`}
                            >
                                <span className="truncate">{layer.text || "Empty Text"}</span>
                                {selectedLayer?.id === layer.id && <div className="w-2 h-2 rounded-full bg-tbi-900"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedLayer && (
                <div className="flex flex-col gap-6 overflow-y-auto p-2 flex-1 pr-4 custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <h3 className="text-white font-bold text-lg">Edit Layer</h3>
                        <button
                            onClick={() => onRemoveLayer(selectedLayer.id)}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Text Content */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Text Content</label>
                            <input
                                type="text"
                                className="bg-gray-900/50 border border-gray-700 rounded-md p-2 text-white focus:outline-none transition-colors"
                                value={selectedLayer.text}
                                onChange={(e) => onUpdateLayer({ text: e.target.value })}
                            />
                        </div>

                        {/* Position Group */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Position</label>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>X Axis</span>
                                    <span>{Math.round(selectedLayer.x)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={selectedLayer.x}
                                    onChange={(e) => onUpdateLayer({ x: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 appearance-none cursor-pointer accent-tbi-900 accent-square"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Y Axis</span>
                                    <span>{Math.round(selectedLayer.y)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={selectedLayer.y}
                                    onChange={(e) => onUpdateLayer({ y: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>
                        </div>

                        {/* Typography Group */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Typography</label>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Size</span>
                                    <span>{selectedLayer.fontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={300}
                                    value={selectedLayer.fontSize}
                                    onChange={(e) => onUpdateLayer({ fontSize: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>

                            <div className="flex flex-col gap-1 relative">
                                <span className="text-xs text-gray-500 mb-1">Font Family</span>
                                <div
                                    onClick={() => setIsFontOpen(!isFontOpen)}
                                    className="bg-gray-900/50 border border-gray-700 rounded-md p-2 text-sm text-white flex justify-between items-center cursor-pointer hover:border-tbi-900 transition-colors"
                                >
                                    <span className="truncate">{selectedLayer.fontFamily}</span>
                                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isFontOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isFontOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-xl z-50 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {FONT_FAMILIES.map((font) => (
                                            <div
                                                key={font}
                                                onClick={() => {
                                                    onUpdateLayer({ fontFamily: font });
                                                    setIsFontOpen(false);
                                                }}
                                                className={`p-2 cursor-pointer hover:bg-gray-800 transition-colors text-sm ${selectedLayer.fontFamily === font ? 'text-tbi-900 bg-tbi-900/10' : 'text-gray-300'}`}
                                                style={{ fontFamily: font }}
                                            >
                                                {font}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Weight</span>
                                    <span>{selectedLayer.fontWeight}</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={900}
                                    step={100}
                                    value={selectedLayer.fontWeight || 400}
                                    onChange={(e) => onUpdateLayer({ fontWeight: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 mb-1">Color</span>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        className="h-8 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                                        value={selectedLayer.color}
                                        onChange={(e) => onUpdateLayer({ color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="bg-gray-900/50 border border-gray-700 rounded-md p-1.5 text-sm text-white flex-1 focus:outline-none"
                                        value={selectedLayer.color}
                                        onChange={(e) => onUpdateLayer({ color: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Appearance Group */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Appearance</label>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Opacity</span>
                                    <span>{Math.round(selectedLayer.opacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={selectedLayer.opacity}
                                    onChange={(e) => onUpdateLayer({ opacity: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Rotation</span>
                                    <span>{selectedLayer.rotation}°</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={360}
                                    value={selectedLayer.rotation}
                                    onChange={(e) => onUpdateLayer({ rotation: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>
                        </div>

                        {/* Shadow Group */}
                        <div className="space-y-3">
                            <label className="text-xs text-gray-400 uppercase font-semibold tracking-wide">Shadow</label>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 mb-1">Shadow Color</span>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        className="h-8 w-8 rounded cursor-pointer border-none bg-transparent p-0"
                                        value={selectedLayer.shadowColor}
                                        onChange={(e) => onUpdateLayer({ shadowColor: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="bg-gray-900/50 border border-gray-700 rounded-md p-1.5 text-sm text-white flex-1 focus:border-tbi-900 focus:outline-none"
                                        value={selectedLayer.shadowColor}
                                        onChange={(e) => onUpdateLayer({ shadowColor: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Blur Radius</span>
                                    <span>{selectedLayer.shadowBlur}px</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={50}
                                    value={selectedLayer.shadowBlur}
                                    onChange={(e) => onUpdateLayer({ shadowBlur: Number(e.target.value) })}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-tbi-900"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}