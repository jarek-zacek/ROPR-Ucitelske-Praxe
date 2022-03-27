import "./WaitingListComponent.css";
import {Navigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {axios} from "../../axios.js";
import {Container} from "react-bootstrap";

export const WaitingListComponent = () => {
    const [users, setUsers] = useState([]);
    const noUsers = !users || (users && users.length === 0);

    const getLockedUsers = async () => {
        if (checkRole()) return;
        const response = await axios({
            url: "http://localhost:8080/coordinator/waitingList",
            withCredentials: true,
            method: "GET",
        }).catch((err) => {
            alert(err.response.data.message);
            console.log(err.response.data.message);
        });
        if (response && response.data) {
            console.log(response);
            setUsers(response.data);
        }
    };

    useEffect(() => {
        getLockedUsers();
    }, []);

    const acceptUser = async (id) => {
        const response = await axios({
            url: `coordinator/users/${id}/acceptUser`,
            withCredentials: true,
            method: "PUT",
        }).catch((err) => {
            alert(err.response.data.message);
            console.log(err.response.data.message);
        });
        if (response && response.data) {
            console.log(response);
            setUsers(response.data);
        }
        await getLockedUsers();
    };

    const removeUser = async (id) => {
        const response = await axios({
            url: `coordinator/users/${id}/removeUser`,
            withCredentials: true,
            method: "PUT",
        }).catch((err) => {
            alert(err.response.data.message);
            console.log(err.response.data.message);
        });
        if (response && response.data) {
            console.log(response);
            setUsers(response.data);
        }
        await getLockedUsers();
    };

    const checkRole = () => {
        return localStorage.getItem("role") !== "ROLE_COORDINATOR";
    };

    if (checkRole()) return <Navigate to="/login"/>;
    return (
        <Container fluid>
            <table className="table table-striped">
                <thead>
                <tr>
                    <th scope="col">Jméno</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Telefon</th>
                    <th scope="col">Škola</th>
                </tr>
                </thead>
                <tbody>
            {!noUsers &&
            users.map((item, index) => (
                <tr>
                    <th scope="row">{item.firstName + " " + item.secondName}</th>
                    <td>{item.username}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.school.name}</td>
                </tr>
            ))}
            </tbody>
            </table>
        </Container>
    );
};

export default WaitingListComponent;
