import type { IApiImageData } from "../../../backend/src/common/ApiImageData";
import { ImageGrid } from "./ImageGrid.tsx";

interface IAllImagesProps {
    imageData: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    searchPanel?: React.ReactNode;
}

export function AllImages({ imageData, isLoading, hasError, searchPanel }: IAllImagesProps) {
    if (isLoading) {
        return (
            <>
                <h2>All Images</h2>
                <p>Loading images...</p>
            </>
        );
    }
    
    if (hasError) {
        return (
            <>
                <h2>All Images</h2>
                <p>Error loading images. Please try again later.</p>
            </>
        );
    }
    
    return (
        <>
            <h2>All Images</h2>
            {searchPanel}
            <ImageGrid images={imageData} />
        </>
    );
}
