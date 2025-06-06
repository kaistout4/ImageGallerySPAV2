import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onUpdateImageName?: (imageId: string, newName: string) => Promise<void>;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [inProgress, setIsInProgress] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    async function handleSubmitPressed() {
        setIsInProgress(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/images/${props.imageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: input
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            if (props.onUpdateImageName) {
                await props.onUpdateImageName(props.imageId, input);
            }
            
            setIsEditingName(false);
            setError(null);
        } catch (err) {
            setError("Failed to update image name. Please try again.");
            console.error("Error updating image name:", err);
        } finally {
            setIsInProgress(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)}
                        disabled={inProgress}
                    />
                </label>
                <button 
                    disabled={input.length === 0 || inProgress} 
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                {inProgress && <p>Working...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}