import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import { io } from "socket.io-client";
import Peer from "peerjs";

const ip = "192.168.1.39";
const socket = io(`https://${ip}:5001`, { transports: ["websocket", "polling", "flashsocket"] });

const VideoGrid = () => {
  const { room } = useParams();

  const peers = useRef({});
  const videoGridRef = useRef();

  useEffect(() => {
    if (!videoGridRef.current) return;

    try {
      const peer = new Peer(undefined, { host: ip, port: 5002, path: "/" });

      navigator.mediaDevices
        .getUserMedia({ video: { width: { exact: 320 }, height: { exact: 240 } }, audio: false })
        .then((stream) => {
          VideoGridItem(videoGridRef, stream, true);

          peer.on("call", (call) => {
            call.answer(stream);
            call.on("stream", (uStream) => VideoGridItem(videoGridRef, uStream));
          });

          socket.on("user-connected", (user) => {
            const call = peer.call(user, stream);

            let uVideo;
            call.on("stream", (uStream) => (uVideo = VideoGridItem(videoGridRef, uStream)));
            call.on("close", () => uVideo.remove());

            peers.current[user] = call;
          });
        })
        .catch((error) => alert("Media Error : " + error));

      socket.on("user-disconnected", (user) => peers.current[user] && peers.current[user].close());

      peer.on("open", (id) => socket.emit("join-room", room, id));
    } catch (error) {
      alert("Other Error : " + error);
    }
  }, [room]);

  return (
    <div className="App">
      <div ref={videoGridRef} className="Video-Grid" />
    </div>
  );
};

const VideoGridItem = (videoGridRef, stream, muted) => {
  const video = document.createElement("video");
  video.srcObject = stream;
  if (muted) video.muted = true;
  video.onloadedmetadata = () => video.play();
  videoGridRef.current.append(video);

  return video;
};

// const VideoGridItem = ({ stream }) => <video srcObject={stream} onLoadedMetadata={(e) => e.play()} />;

export default VideoGrid;
