import { useState, useRef, useEffect,  } from "react";

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaStream(stream);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        stopWebcam();
      }
    }
  };

  const resetState = () => {
    stopWebcam();
    setCapturedImage(null);
  };

  useEffect(() => {
    function handleClickOutside() {
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {capturedImage ? (
        <>
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-lg"
          />
          <button
            onClick={resetState}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded-full py-2 px-5 text-base shadow hover:bg-gray-100 focus:outline-none"
          >
            เริ่มใหม่
          </button>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          {!mediaStream ? (
            <button
              onClick={startWebcam}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded-full py-2 px-5 text-base shadow hover:bg-gray-100 focus:outline-none"
            >
              เปิดกล้อง
            </button>
          ) : (
            <button
              onClick={captureImage}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded-full py-2 px-5 text-base shadow hover:bg-gray-100 focus:outline-none"
            >
              ถ่ายภาพ
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default WebcamCapture;
