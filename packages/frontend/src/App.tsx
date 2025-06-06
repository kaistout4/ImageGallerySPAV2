import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router";
import { MainLayout } from "./MainLayout.tsx";
import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes";
import type { IApiImageData } from "../../backend/src/common/ApiImageData";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [searchString, setSearchString] = useState("");
    const requestNumberRef = useRef(0);
    
    const fetchImages = (searchQuery?: string) => {
        setIsLoading(true);
        setHasError(false);
        
        requestNumberRef.current++;
        const thisRequestNumber = requestNumberRef.current;
        
        const url = searchQuery 
            ? `/api/images/search?q=${encodeURIComponent(searchQuery)}`
            : "/api/images";
            
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (thisRequestNumber === requestNumberRef.current) {
                    setImageData(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (thisRequestNumber === requestNumberRef.current) {
                    console.error("Error fetching images:", error);
                    setHasError(true);
                    setIsLoading(false);
                }
            });
    };
    
    useEffect(() => {
        // Code in here will run when App is created
        // (Note in dev mode App is created twice)
        fetchImages();
    }, []);
    
    const handleUpdateImageName = async (imageId: string, newName: string): Promise<void> => {
        // For now, just update the local state
        // In the future, this will also update the server
        setImageData(prevData => 
            prevData.map(image => 
                image.id === imageId 
                    ? { ...image, name: newName }
                    : image
            )
        );
    };
    
    const handleImageSearch = () => {
        fetchImages(searchString);
    };
    
    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={
                    <AllImages 
                        imageData={imageData} 
                        isLoading={isLoading} 
                        hasError={hasError} 
                        searchPanel={
                            <ImageSearchForm 
                                searchString={searchString} 
                                onSearchStringChange={setSearchString} 
                                onSearchRequested={handleImageSearch} 
                            />
                        } 
                    />
                } />
                <Route path={ValidRoutes.IMAGE_DETAILS.substring(1)} element={<ImageDetails imageData={imageData} isLoading={isLoading} hasError={hasError} onUpdateImageName={handleUpdateImageName} />} />
                <Route path={ValidRoutes.UPLOAD.substring(1)} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN.substring(1)} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;
