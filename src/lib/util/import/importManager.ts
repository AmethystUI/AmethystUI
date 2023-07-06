import { _elementStyle, _unitedAttr } from "$src/lib/@types/element";
import { _project } from "$src/lib/@types/general";
import { closeOverlay, overlayClosable } from "$src/lib/comp/overlays/overlayManager";
import { openProgressOverlay, progressController as PC } from "$src/lib/comp/overlays/overlayWindows/progress/progressOverlayManager";
import { collection, focusedComponent, focusedOverride, selectedComponent, selectedOverride } from "$src/lib/stores/collection";
import { fileSettings } from "$src/lib/stores/fileStatus";
import * as t from 'io-ts';
import _ from "lodash";
import { get } from "svelte/store";

// HTML template for the file upload prompt
const fileUploadTemplate = `
<input type="file" id="fileUpload" accept=".json">
`;

// Function to parse the uploaded JSON file
const parseUploadedJSON = (file: File): Promise<any> => {
    return new Promise((res, rej) => {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            try {
                const parsedData = JSON.parse(event.target!.result as string);
                res(parsedData);
            } catch (error) {
                rej("Failed to parse JSON file");
            }
        };

        reader.onerror = () => {
            rej("Failed to read the uploaded file");
        };

        reader.readAsText(file);
    })
}

// Recursive function to generate the io-ts validator
const generateIoTsValidator = (type: any): any => {
    if (typeof type === 'string') {
        // Handle primitive types
        switch (type) {
            case 'string':
                return t.string;
            case 'number':
                return t.number;
            case 'boolean':
                return t.boolean;
            // Add more primitive types if needed
        }
    } else if (Array.isArray(type)) {
        // Handle array types
        const [arrayType] = type;
        return t.array(generateIoTsValidator(arrayType));
    } else if (typeof type === 'object') {
        // Handle nested object types
        const properties: Record<string, any> = {};
        for (const key in type) {
            if (Object.prototype.hasOwnProperty.call(type, key)) {
                properties[key] = generateIoTsValidator(type[key]);
            }
        }
        return t.type(properties);
    }

    // Return an `any` validator if the type cannot be determined
    return t.any;
};

const updateProject = (dat: project) => {
    fileSettings.update(v => {
        v.name = dat.name;
        return v;
    });
    
    // check if the currently selected override & element exists
    if(!dat.content[get(selectedComponent)]){ // if the currently selected component doesn't exist
        // deselect both the component and override
        focusedComponent.set(-1);
        selectedComponent.set(-1);
        focusedOverride.set(-1);
        selectedOverride.set(-1);
    } else {
        if(!dat.content[get(selectedComponent)].styleOverrides[get(selectedOverride)]){ // if the override doesn't exist
            // deselect both the override
            focusedOverride.set(-1);
            selectedOverride.set(-1);
        }
    }

    collection.set(dat.content);
}

export const startImport = async () => {
    const fileUploadContainer = document.createElement("div");
    fileUploadContainer.innerHTML = fileUploadTemplate;

    const fileUploadInput = fileUploadContainer.querySelector(
        "#fileUpload"
    ) as HTMLInputElement;

    fileUploadInput.onchange = async () => {
        fileUploadInput.onchange = null;

        // open overlay
        openProgressOverlay("Importing", 1);
        
        const selectedFile = fileUploadInput.files && fileUploadInput.files[0];

        if (selectedFile) {
            try {
                const parsedData = await parseUploadedJSON(selectedFile);
                
                if(_project.decode(parsedData)._tag !== "Right") throw new Error("JSON structure corrupted");

                PC.successResult();

                updateProject(parsedData);
        
                closeOverlay(1200);

                return <project> parsedData;
            } catch (err) {
                let message = "Broken JSON";
                if (err instanceof Error) message = err.message;
                else message = String(err)
                
                await PC.errorResult(message, "Import failed.");
            }
        } else {
            await PC.errorResult("No file selected", "Import failed.");
        }
        
        closeOverlay(5000, true);
    };

    fileUploadInput.click();
};


// npx ts-json-schema-generator --path "./src/lib/@types/*.d.ts" --type "project"