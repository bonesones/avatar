import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function App() {
  const [crop, setCrop] = useState<Crop>({
    width: 300,
    height: 300,
    unit: "px",
    x: 0,
    y: 0,
  });

  const [upImg, setUpImg] = useState("");

  const [cropedImage, setCroppedImage] = useState<string | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImage = async (): Promise<string | null> => {
    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const scaleX = image!.naturalWidth / image!.width;
    const scaleY = image!.naturalHeight / image!.height;

    canvas.width = image!.width;
    canvas.height = image!.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image as CanvasImageSource,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      image!.width,
      image!.height
    );

    // круглая маска
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(
      image!.width / 2,
      image!.height / 2,
      image!.width / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.globalCompositeOperation = "source-over";

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const fileURL = URL.createObjectURL(blob);
        resolve(fileURL);
      }, "image/png");
    });
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImage();
      console.log(croppedImage)
      setCroppedImage(croppedImage);
    } catch (e) {
      console.log(e);
    }
  };

  const imgRef = useRef<HTMLImageElement>(null);

  const handlClick = () => {
    showCroppedImage();
  };

  const handleCropChange = (c: PixelCrop) => {
    setCrop(c);
  };

  return (
    <div>
      <h2>Загрузка аватарки</h2>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {upImg && (
        <>
          <ReactCrop
            crop={crop}
            onChange={handleCropChange}
            aspect={1}
            circularCrop
            keepSelection
            minWidth={100}
            minHeight={100}
          >
            <img ref={imgRef} src={upImg} width="300px" height="300px" />
          </ReactCrop>
          <button onClick={handlClick}>Download</button>
        </>
      )}
      {cropedImage && <img src={cropedImage} />}
    </div>
  );
}

export default App;
