import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

function HomePage() {
  return <h2>Home</h2>;
}

function AboutPage() {
  return <h2>About</h2>;
}

const ChildApp = () => {
  const location = useLocation();
  const [initialRoute, setInitialRoute] = useState("");
  const [backHistoryStack, setBackHistoryStack] = useState([]);
  const [forwardHistoryStack, setForwardHistoryStack] = useState([]);

  useEffect(() => {
    const receiveMessageFromParent = (event) => {
      if (event.origin !== "http://localhost:3000") return;

      const dataFromParent = event.data;
      sessionStorage.setItem("message", dataFromParent.message);
      console.log(dataFromParent);
    };

    window.addEventListener("message", receiveMessageFromParent);

    return () => {
      window.removeEventListener("message", receiveMessageFromParent);
    };
  }, []);

  useEffect(() => {
    const savedRoute = sessionStorage.getItem("route");
    if (savedRoute) {
      const newLocation = "http://localhost:3001" + savedRoute;

      console.log("new location ", newLocation, "\n", window.location.href);

      if (window.location.href !== newLocation) {
        window.location.href = "http://localhost:3001" + savedRoute;
      }
      // setInitialRoute(savedRoute);
    } else {
      sessionStorage.setItem("route", location.pathname);
      // setInitialRoute(location.pathname);
    }
  }, [location.pathname]);

  const handleLinkClick = (route) => {
    setBackHistoryStack([...backHistoryStack, route]);
    sessionStorage.setItem("route", route);
    setInitialRoute(route);
    window.parent.postMessage({ route }, "*");
  };

  const goBack = () => {
    if (backHistoryStack.length > 1) {
      const newStack = [...backHistoryStack];
      const lastRoute = newStack.pop();
      setBackHistoryStack(newStack);
      setForwardHistoryStack([...forwardHistoryStack, lastRoute]);
      const newRoute = newStack[newStack.length - 1];
      setInitialRoute(newRoute);
      sessionStorage.setItem("route", newRoute);
      window.parent.postMessage({ route: newRoute }, "*");
    }
  };

  const goForward = () => {
    if (forwardHistoryStack.length > 0) {
      const newStack = [...forwardHistoryStack];
      const nextRoute = newStack.pop();
      setForwardHistoryStack(newStack);
      setBackHistoryStack([...backHistoryStack, nextRoute]);
      setInitialRoute(nextRoute);
      sessionStorage.setItem("route", nextRoute);
      window.parent.postMessage({ route: nextRoute }, "*");
    }
  };

  const GetURL = () => {
    console.log(window.location.href);
  };

  const sendDataToParent = () => {
    const data = {
      message: "Hello from Child!",
    };
    window.parent.postMessage(data, "http://localhost:3000");
  };

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

      <Routes location={initialRoute || location}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>

      <main>
        <div>
          <h1>Child Application</h1>
          <button onClick={sendDataToParent}>Send Data to Parent</button>
          <button onClick={goBack}>Go Back</button>
          <button onClick={goForward}>Go Forward</button>
          <button onClick={GetURL}>Get </button>
        </div>
      </main>
    </div>
  );
};

export default ChildApp;
