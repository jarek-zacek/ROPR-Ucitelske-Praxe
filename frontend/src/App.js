import NavbarComponent from "./components/navbar/NavbarComponent";
import StudentHomeView from "./views/studentHome/StudentHomeView";
import TeacherHomeView from "./views/teacherHome/TeacherHomeView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginView from "./views/login/LoginView";

function App() {
  return (
    <div className="app">
      <NavbarComponent />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginView />} />
          <Route path="studentHome" element={<StudentHomeView />} />
          <Route path="teacherHome" element={<TeacherHomeView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
