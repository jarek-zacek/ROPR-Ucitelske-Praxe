import Navbar from "react-bootstrap/Navbar";
import { Container, Nav } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../../resources/OUbile.png";
import "./NavbarStyles.css";
import { BsFillHouseFill, BsFillPersonFill } from "react-icons/bs";
import LoginControlComponent from "../login/logincontrol/LoginControlComponent";

let iconStyles = { fontSize: "2.5em" };

function refreshPage() {
    window.location.reload();
}

const NavbarComponent = () => {

    const redirectBasedOnRoleMainView = () => {
        switch (JSON.parse(localStorage.getItem("user")).role) {
            case 'ROLE_STUDENT':
                return window.location.href = '/studentHome';
            case "ROLE_TEACHER":
                return window.location.href = '/teacherHome';
            case 'ROLE_COORDINATOR':
                return window.location.href = '/coordinatorHome';
            case 'ROLE_ADMIN':
                return window.location.href = '/adminHome';
            default:
                console.log("Bad redirection, returning to login...");
                return window.location.href = '/login';
        }
    }

    const redirectBasedOnRolePersonalPage = () => {
        switch (JSON.parse(localStorage.getItem("user")).role) {
            case 'ROLE_STUDENT':
                return window.location.href = '/studentPersonal';
            case "ROLE_TEACHER":
                return window.location.href = '/teacherPersonal';
            case 'ROLE_COORDINATOR':
                return window.location.href = '/coordinatorPersonal';
            case 'ROLE_ADMIN':
                return window.location.href = '/adminPersonal';
            default:
                return window.location.href = '/login';
        }
    }
    return (
        <div className="navbar-main">
            <Navbar>
                <div className="main-container">
                    <Navbar.Brand href="#" className="navbar-brand">
                        <img
                            onClick={refreshPage}
                            className="img-responsive"
                            src={Logo}
                            alt="logo"
                        />
                    </Navbar.Brand>
                    <Nav className="navbar-links">
                        <Nav.Link className="nav-link">
                            <span className="my-hover" onClick={() => redirectBasedOnRoleMainView()} id="prehled">
                                <BsFillHouseFill className="icon" style={iconStyles} />
                                <p className={"p-margin"}>Domů</p>
                            </span>
                        </Nav.Link>
                        <Nav.Link className="nav-link">
                            <span className="my-hover" onClick={() => redirectBasedOnRolePersonalPage()} id="prehled">
                                <BsFillPersonFill className="icon" style={iconStyles} />
                                <p className={"p-margin"}>Účet</p>
                            </span>
                        </Nav.Link>
                    </Nav>
                    <Navbar.Collapse className="margin-left-cstm-nav">
                        <Nav>
                            <Nav eventkey={2} className="navbar-text white">
                                <LoginControlComponent />
                            </Nav>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>
        </div>
    );
    // return (
    //     <div className={"navbar-main"}>
    //         <Navbar collapseOnSelect expand="md" variant="light">
    //             <Container fluid className="max-height-css">
    //                 <Navbar.Brand href="#">
    //                     <img
    //                         onClick={refreshPage}
    //                         width="90px"
    //                         height="90px"
    //                         className="img-responsive"
    //                         src={Logo}
    //                         alt="logo"
    //                     />
    //                 </Navbar.Brand>
    //                 <Nav className="me-auto">
    //                         <Nav.Link className="ms-md-5">
    //                             <span onClick={() => redirectBasedOnRoleMainView()} id="prehled">
    //                                 <BsFillHouseFill style={iconStyles} />
    //                                 <p className={"p-margin"}>Domů</p>
    //                             </span>
    //                         </Nav.Link>
    //                         <Nav.Link className="ms-md-5">
    //                             <span onClick={() => redirectBasedOnRolePersonalPage()} id="prehled">
    //                                 <BsFillPersonFill style={iconStyles} />
    //                                 <p className={"p-margin"}>Účet</p>
    //                             </span>
    //                         </Nav.Link>
    //                     </Nav>
    //                 <Navbar.Toggle aria-controls="responsive-navbar-nav margin-left-cstm-nav" />
    //                 <Navbar.Collapse id="responsive-navbar-nav" className="margin-left-cstm-nav">
    //                     <Nav>
    //                         <Nav eventkey={2} className="navbar-text white">
    //                             <LoginControlComponent />
    //                         </Nav>
    //                     </Nav>
    //                 </Navbar.Collapse>
    //             </Container>
    //         </Navbar>
    //     </div>
    // );
};

export default NavbarComponent;
