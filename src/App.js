import React, { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { PARENT_ORIGIN } from "./env";
import axios from "axios";

function HomePage() {
  return <h2>Home</h2>;
}

function AboutPage() {
  return <h2>About</h2>;
}

const ChildApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    const receiveMessageFromParent = (event) => {
      if (event.origin !== PARENT_ORIGIN) return;

      const dataFromParent = event.data;
      localStorage.setItem("message", dataFromParent.message);
      console.log(dataFromParent);
    };

    window.addEventListener("message", receiveMessageFromParent);

    return () => {
      window.removeEventListener("message", receiveMessageFromParent);
    };
  }, []);

  const handleLinkClick = (route) => {
    localStorage.setItem("route", route);
    navigate(route);
    window.parent.postMessage({ route }, "*");
  };

  const sendDataToParent = () => {
    const data = {
      message: "Hello from Child!",
    };
    window.parent.postMessage(data, PARENT_ORIGIN);
  };

  useEffect(() => {
    axios
      .get("https://nachos.riskwisepro.io/1.png", { responseType: "blob" })
      .then((response) => {
        const reader = new window.FileReader();
        reader.readAsDataURL(response.data);
        reader.onload = () => {
          setImageURL(reader.result);
        };
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
  }, []);

  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/home" onClick={() => handleLinkClick("/home")}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => handleLinkClick("/about")}>
              About
            </Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>

      <main>
        <div>
          <h1>Child Application</h1>
          <button onClick={sendDataToParent}>Send Data to Parent</button>
        </div>
      </main>
      <section>
        <div>{imageURL && <img src={imageURL} alt="Image" />}</div>
      </section>
    </div>
  );
};

export default ChildApp;
