// HTML template for the file upload prompt
const fileUploadTemplate = `
<input type="file" id="fileUpload" accept=".json">
`;

// Function to parse the uploaded JSON file
const parseUploadedJSON = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
            const parsedData = JSON.parse(event.target!.result as string);
            return parsedData;
        } catch (error) {
            throw new Error('Failed to parse JSON file');
        }
    };

    reader.onerror = () => {
        throw new Error('Failed to read the uploaded file');
    };

    reader.readAsText(file);
}

export const startImport = async () => {
    const fileUploadContainer = document.createElement("div");
    fileUploadContainer.innerHTML = fileUploadTemplate;

    const fileUploadInput = fileUploadContainer.querySelector(
        "#fileUpload"
    ) as HTMLInputElement;

    fileUploadInput.onchange = async () => {
        const selectedFile = fileUploadInput.files && fileUploadInput.files[0];

        if (selectedFile) {
            try {
                console.log(selectedFile);
                const parsedData = await parseUploadedJSON(selectedFile);
                console.log(parsedData);
                // resolve(parsedData);
            } catch (error) {
                console.error(error);
            }
        } else {
            // reject(new Error("No file selected"));
            console.error("No file selected");
        }
    };

    fileUploadInput.click();
};
