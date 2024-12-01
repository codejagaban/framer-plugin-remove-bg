import { framer } from "framer-plugin";
import { useState, useEffect, FormEvent } from "react";
import "./App.css";

const apiKey = localStorage.getItem("apiBgKey");

// Function to upload the Blob to a storage endpoint and get a public HTTPS URL
async function uploadBlobAndGetURL(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("UPLOADCARE_PUB_KEY",  import.meta.env.VITE_UC_PUBLIC_KEY); // Replace with your Uploadcare public key
  formData.append("file", blob);

  const response = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }

  const data = await response.json();
  return `https://ucarecdn.com/${data.file}/`;
}

// Function to remove the background from an image using remove.bg API
async function removeBg(imageURL: string) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", imageURL);

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey as string },
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();

      // Upload the Blob to get a public HTTPS URL
      const httpsURL = await uploadBlobAndGetURL(blob);

      // Use Framer.setImage with the HTTPS URL
      await framer.setImage({ image: httpsURL });

      console.log("Image successfully uploaded and set in Framer: ", httpsURL);
      framer.notify("Background removed successfully", {
        variant: "success",
      });
    } else {
      handleResponseError(response);
    }
  } catch (error) {
    console.error("Error during background removal: ", error);
  }
}

// Handle API response errors
function handleResponseError(response: Response) {
  if (response.status === 403) {
    framer.notify("API Key is invalid", {
      button: {
        text: "Set API Key",
        onClick: () => {
          setShowUI(true);
          framer.showUI({
            position: "top right",
            width: 350,
            height: 200,
          });
        },
      },
      durationMs: 200000,
      variant: "error",
    });
  } else {
    console.error("Response error: ", response);
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

export function App() {
  const [showUI, setShowUI] = useState(false);

  // Function to trigger background removal
  async function removeBackground() {
    if (framer.mode === "image" || framer.mode === "editImage") {
      if (!apiKey) {
        framer.notify("API Key is missing", {
          button: {
            text: "Set API Key",
            onClick: () => {
              setShowUI(true);
              framer.showUI({
                position: "top right",
                width: 350,
                height: 200,
              });
            },
          },
          durationMs: 200000,
          variant: "error",
        });
        return;
      }

      const imgURL = await framer.getImage();
      if (imgURL?.url) {
        console.log("Fetched Image URL: ", imgURL.url);
        await removeBg(imgURL.url);
      }
    } else if (framer.mode === "canvas") {
      framer.notify("Please select an image to remove the background", {
        durationMs: 3000,
        variant: "error",
      });
    }
  }

  // Trigger background removal on component mount
  useEffect(() => {
    removeBackground();
  }, []);

  // Handle API key form submission
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements[0] as HTMLInputElement;
    localStorage.setItem("apiBgKey", input.value);
    framer.notify("API Key saved successfully", {
      durationMs: 3000,
      variant: "success",
    });
  };

  return (
    <main>
      {showUI && (
        <div>
          <p>
            1. Go to the{" "}
            <a
              href="https://www.remove.bg/upload"
              target="_blank"
              rel="noopener noreferrer"
            >
              remove.bg
            </a>{" "}
            website and create a free account (you will need to confirm your
            email).
          </p>
          <p>
            2. After that, you can find your API key here{" "}
            <a
              href="https://www.remove.bg/dashboard#api-key"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.remove.bg/dashboard#api-key
            </a>
            .
          </p>
          <form onSubmit={handleFormSubmit}>
            <div className="form-input">
              <input type="text" placeholder="API Key" />
              <button type="submit" className="framer-button-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}