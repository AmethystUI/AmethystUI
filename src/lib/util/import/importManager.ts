import { systemDefaultStyles } from "$src/lib/@const/element.const";
import * as t from 'io-ts';
import _ from "lodash";

// HTML template for the file upload prompt
const fileUploadTemplate = `
<input type="file" id="fileUpload" accept=".json">
`;

// Function to parse the uploaded JSON file
const parseUploadedJSON = (file: File): Promise<any[]> => {
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

export const startImport = async () => {
    // const fileUploadContainer = document.createElement("div");
    // fileUploadContainer.innerHTML = fileUploadTemplate;

    // const fileUploadInput = fileUploadContainer.querySelector(
    //     "#fileUpload"
    // ) as HTMLInputElement;

    // fileUploadInput.onchange = async () => {
    //     const selectedFile = fileUploadInput.files && fileUploadInput.files[0];

    //     if (selectedFile) {
    //         try {
    //             const parsedData: any[] = await parseUploadedJSON(selectedFile);
    //             console.log(parsedData.length);
    //             // console.log(verifyData(parsedData));
    //             // resolve(parsedData);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     } else {
    //         // reject(new Error("No file selected"));
    //         console.error("No file selected");
    //     }
    // };

    // fileUploadInput.click();
};

// npx ts-json-schema-generator --path "./src/lib/@types/*.d.ts" --type "project"