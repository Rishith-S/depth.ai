import LandingScreen from "./LandingScreen";
import { useCallback, useState } from "react";
import { removeBackground } from "../services/removeBg";
import ImageEditor from "./ImageEditor";
import Navbar from "./Navbar";

export default function Homescreen() {
    const [url, setUrl] = useState<string | undefined>();
    const [bgUrl, setBgUrl] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const objectURL = URL.createObjectURL(file);
            const processedImage = await removeBackground(objectURL);
            setUrl(processedImage);
            setBgUrl(objectURL);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [])
    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
            <Navbar
                uploadFile={handleFileChange}
                hasImage={!!url}
                onReset={() => {
                    setUrl(undefined);
                    setBgUrl(undefined);
                }}
            />
            <div className="flex-1 overflow-hidden">
                {
                    !url && !loading ? (
                        <LandingScreen handleFileChange={handleFileChange} />
                    ) : (
                        loading ? (
                            <p className="text-white font-bold text-2xl flex items-center justify-center h-full">Loading...</p>
                        ) : (
                            <ImageEditor url={url!} bgUrl={bgUrl!} />
                        )
                    )
                }
            </div>
        </div>
    );
}