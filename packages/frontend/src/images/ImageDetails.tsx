import { useParams } from "react-router";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData";
import { ImageNameEditor } from "../ImageNameEditor";

interface IImageDetailsProps {
    imageData: IApiImageData[];
    isLoading: boolean;
    hasError: boolean;
    onUpdateImageName?: (imageId: string, newName: string) => Promise<void>;
}

export function ImageDetails({ imageData, isLoading, hasError, onUpdateImageName }: IImageDetailsProps) {
    const { imageId } = useParams<{ imageId: string }>();
    
    if (isLoading) {
        return <p>Loading image details...</p>;
    }
    
    if (hasError) {
        return <p>Error loading image. Please try again later.</p>;
    }
    
    const image = imageData.find(image => image.id === imageId);
    if (!image) {
        return <h2>Image not found</h2>;
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <ImageNameEditor 
                initialValue={image.name} 
                imageId={image.id}
                onUpdateImageName={onUpdateImageName}
            />
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
