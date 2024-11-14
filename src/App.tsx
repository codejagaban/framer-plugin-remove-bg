import { framer, CanvasNode } from "framer-plugin";
import { useState, useEffect, FormEvent } from "react";
import "./App.css";

// framer.notify("Background removed successfully", {
//   // button: { text: "Undo", onClick: handleUndo },
//   durationMs: 3000,
//   // onDisappear: handleDisappear,
//   variant: "success", // Or 'success', 'warning', 'error'
// });

const apiKey = localStorage.getItem("apiBgKey");

console.log("API Key: ", apiKey);
export function App() {
  const [showUI, setShowUI] = useState(false);

    async function removeBg(imageURL: string) {
        const formData = new FormData();
        formData.append("size", "auto");
        formData.append("image_url", imageURL);

        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": apiKey },
            body: formData,
        });

        if (response.ok) {
            return await response.arrayBuffer();
        } else {
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
                    durationMs: 20000,
                    // onDisappear: handleDisappear,
                    variant: "error", // Or 'success', 'warning', 'error'
                })
            }
            console.log("response: ", response);
            throw new Error(`${response.status}: ${response.statusText}`);
        }
    }
  function removeBackground() {
    if (framer.mode === "image" || framer.mode === "editImage") {
      // Do image mode specific logic
      // framer.getImage()
      // framer.setImage()
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
          durationMs: 20000,
          // onDisappear: handleDisappear,
          variant: "error", // Or 'success', 'warning', 'error'
        });
      }
      //code to remove the bg
      const imgURL = async () => await framer.getImage();
      const transformedImage = async () => await removeBg(imgURL);
      console.log("transformedImage: ", transformedImage());
      // fs.writeFileSync("no-bg.png", Buffer.from(rbgResultData));
    } else if (framer.mode === "canvas") {
      return framer.notify("Please select an image to remove the background", {
        durationMs: 3000,
        variant: "error",
      });
    }
  }
  useEffect(() => {
    removeBackground();
  }, []);
  const handelFormSubmit = (e: FormEvent<HTMLFormElement>) => {
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
            remove.bg website and create a free account (you will need to
            confirm your email).
          </p>
          <br />
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
          <br />
          <form onSubmit={handelFormSubmit}>
            <div className="form-input">
              <input type="text" placeholder="API Key" />
              <div>
                {" "}
                <button type="submit" className="framer-button-primary">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
