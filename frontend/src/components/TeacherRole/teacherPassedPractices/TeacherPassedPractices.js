import "./TeacherPassedPractices.css";
import DLImage from "../../../resources/DLImg.svg";
import Accordion from "react-bootstrap/Accordion";
import React, {useEffect, useRef, useState} from "react";
import {Col, Container, Form, Modal, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import {axios} from "../../../axios.js";
import {BsFillXCircleFill, BsInfoCircleFill, BsSearch, BsSliders, BsCheckLg} from "react-icons/bs";
import Badge from "react-bootstrap/Badge";
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import * as rdrLocales from 'react-date-range/dist/locale';
import {DateRange} from 'react-date-range';
import {addDays} from 'date-fns';
import {BsMailbox} from "react-icons/bs";

const URL = `${process.env.REACT_APP_AXIOS_URL}`;

const GET_PRACTICE_LIST_URL_LISTED = `${URL}/teacher/practices-list-past`;
const GET_SUBJECTS_URL = `${URL}/user/subjects`;
const UPLOAD_URL = `${URL}/teacher/report/upload`;

const GET_REVIEWS_URL = `${URL}/teacher/getAllReviews`;

const MAX_REPORT_FILE_SIZE = 2; //MB
const MAX_REPORT_FILE_NAME_LENGTH = 20; //znaky
const ALLOWED_REPORT_EXTENSIONS = ["zip", "docx", "doc", "odt", "pdf", "txt"];
const ALLOWED_REPORT_EXTENSIONS_WITH_DOT = [".zip", ".doc", ".odt", ".pdf", ".docx", ".txt"];

export const TeacherPassedPractices = () => {
        let iconStyleFilter = {fontSize: "1.5em", marginRight: "15px"};
        const schoolFilterParam = "School";
        const subjectFilterParam = "Subject";
        const teacherFilterParam = "Teacher";
        const dateRangeFilterParam = "Date";
        const allFilterParam = "All";
        const noteNotFound = "Poznámka nevyplněna.";
        const [subjects, setSubjects] = useState([]);
        let iconStyles = {fontSize: "1.5em", marginRight: "5px"};
        let iconStylesMail = {fontSize: "1.2em", marginRight: "5px"};
        const [showing, setShowing] = useState(false);
        const [practices, setPraxe] = useState([]);
        const [filterParam, setFilterParam] = useState([allFilterParam]);
        const [dateLimit, setDateLimit] = useState([addDays(new Date(), -30), addDays(new Date(), 30)]);
        const schoolNotFound = "Škola nevyplněna";
        const subjectNotFound = "Předmět nevyplněn";
        const [selectedSchool, setSelectedSchools] = useState("");
        const [selectedSubjectName, setSelectedSubjectName] = useState("");
        const [selectedTeacherName, setSelectedTeacherName] = useState("");
        const [btnText, setBtnText] = useState("Zobrazit možnosti vyhledávání");
        const [selectedFile, setSelectedFile] = useState("");
        const [selectedId, setSelectedId] = useState("");
        const [buttonDisabled, setButtonDisabled] = useState(true);
        const [errorMessage, setErrorMessage] = useState("");
        const [successMessage, setSuccessMessage] = useState("");
        const [alertId, setAlertId] = useState("");
        const [modalShowReview, setModalShowReview] = React.useState(false);
        const [modalShowUpload, setModalShowUpload] = React.useState(false);
        const [fileId, setFileId] = React.useState("");
        const [fileIndex, setFileIndex] = React.useState("");
        const [selectedReview, setSelectedReview] = useState("");
        const [reviews, setReviews] = useState([]);
        const [studentNames, setStudentNames] = useState([])
        const [shouldCall, setShouldCall] = useState(true);
        const [dateRange, setDateRange] = useState([
            {
                startDate: new Date(),
                endDate: new Date(),
                key: 'selection'
            }
        ]);
        //state for checking file name length
        const [fileNameLength, setFileNameLength] = useState(true);
        //state for checking file size
        const [fileSize, setFileSize] = useState(true);
        // for file upload progress message
        const [fileUploadProgress, setFileUploadProgress] = useState(false);
        //for displaying response message
        const [fileUploadResponse, setFileUploadResponse] = useState(null);
        const [fileExt, setFileExt] = useState("");

        const onFileChange = (e) => {
            setSelectedFile(e.target.files[0]);
            setFileSize(e.target.files[0].size / 1000000);
            setFileNameLength(e.target.files[0].name.length);

            let split = e.target.files[0].name.split(".");
            setFileExt(split[split.length - 1]);
            setButtonDisabled(false);
        };

        const onFileUpload = (e, id, index) => {
            e.preventDefault();
            setButtonDisabled(true);

            if (fileSize > MAX_REPORT_FILE_SIZE) {
                setAlertId(index);
                setSuccessMessage("");
                setErrorMessage(`Soubor nesmí být větší než ${MAX_REPORT_FILE_SIZE} MB.`);
                return;
            }
            if (fileNameLength > MAX_REPORT_FILE_NAME_LENGTH) {
                setAlertId(index);
                setSuccessMessage("");
                setErrorMessage(`Délka názvu souboru nesmí být větší než ${MAX_REPORT_FILE_NAME_LENGTH} znaků.`);
                return;
            }
            if (!ALLOWED_REPORT_EXTENSIONS.includes(fileExt)) {
                setAlertId(index);
                setSuccessMessage("");
                setErrorMessage(`Nepovolená přípona souboru (mohou být jen: ${ALLOWED_REPORT_EXTENSIONS.join(', ')}).`);
                return;
            }
            let formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('id', id);

            axios({
                method: 'POST',
                url: UPLOAD_URL,
                withCredentials: true,
                headers: {'content-type': 'application/json'},
                data: formData,
            }).then(function (response) {
                setAlertId(index);
                setSuccessMessage("Soubor byl úspěšně nahrán.");
                setErrorMessage("");
                getPraxe();
            })
                .catch(function (error) {
                    console.log(error);
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();
                    setAlertId(index);
                    setSuccessMessage("");
                    setErrorMessage(resMessage);
                });
        }

        const changeBtnText = () => {
            if (!showing) {
                setBtnText("Schovat možnosti vyhledávání");
            } else {
                setBtnText("Zobrazit možnosti vyhledávání");
            }
        }

        function resetFilter() {
            setFilterParam([allFilterParam]);
            setSelectedSchools("");
            setSelectedSubjectName("");
            setSelectedTeacherName("");
            setDateRange([
                {
                    startDate: new Date(),
                    endDate: new Date(),
                    key: 'selection'
                }
            ]);
        }

        const getSubjects = async () => {
            const response = await axios({
                url: GET_SUBJECTS_URL,
                withCredentials: true,
                method: "GET",
            }).then((response) => {
                const sch = [];
                response.data.forEach(element => sch.push(element.name));
                setSubjects(sch);

            });
        };

        const getPraxe = async () => {
            const response = await axios({
                url: GET_PRACTICE_LIST_URL_LISTED,
                withCredentials: true,
                method: "GET",
            }).catch((err) => {
                console.log(err.response.data.message);
            });
            if (response && response.data) {
                setPraxe(response.data);
                setDateRangeLimit(response.data);
            }
        };


        const getStudentReview = async (email, practiceId) => {
            const response = await axios({
                url: `${URL}/teacher/getReview/${email}/${practiceId}`,
                withCredentials: true,
                method: "GET",
            }).catch((err) => {
                setModalShowReview(true);
            });
            if (response && response.data) {
                setSelectedReview(response.data);
                setModalShowReview(true);
            } else {
                setModalShowReview(true);
            }
        };


        const getStudentReviews = async () => {
            const response = await axios({
                url: GET_REVIEWS_URL,
                withCredentials: true,
                method: "GET",
            }).then((response) => {
                setReviews(response.data)
            });
        };


        useEffect(() => {
            getPraxe();
            getSubjects();
            getStudentReviews();
        }, []);

        function setDateRangeLimit(practices) {
            let lowestDate = new Date(practices[0].date.split('-'));
            let highestDate = new Date(practices[0].date.split('-'));

            practices.forEach(element => {
                if (new Date(element.date.split('-')) < lowestDate) {
                    lowestDate = new Date(element.date.split('-'))
                }
                if (new Date(element.date.split('-')) > highestDate) {
                    highestDate = new Date(element.date.split('-'))
                }
            });
            setDateLimit([addDays(lowestDate, -1), addDays(highestDate, 1)]);
        }

        function CreateModalReview(props) {
            return (
                <Modal
                    {...props}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Recenze studenta {selectedReview.name}</h4>
                        <div className="mt-3">
                        {selectedReview ? <p>
                            {selectedReview.reviewText}
                        </p> : <p>Student zatím praxi neohodnotil...</p>}
                        </div>

                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="accept-btn my-btn-white" onClick={props.onHide}>Odejít</button>
                    </Modal.Footer>
                </Modal>
            );
        }

        function search(items) {
            return items.filter((item) => {

                if (filterParam.includes(allFilterParam)) {
                    return true;
                }

                if (filterParam.includes(schoolFilterParam) && (item.teacher.school == null || item.teacher.school.name !== selectedSchool)) {
                    return false;
                }

                if (filterParam.includes(subjectFilterParam) && (item.subject == null || item.subject.name !== selectedSubjectName)) {
                    return false;
                }

                if (filterParam.includes(teacherFilterParam) && (item.teacher.firstName !== selectedTeacherName.split(" ")[0] || item.teacher.secondName !== selectedTeacherName.split(" ")[1])) {
                    return false;
                }

                if (filterParam.includes(dateRangeFilterParam) && (new Date(item.date.split('-')) < dateRange[0].startDate || new Date(item.date.split('-')) > dateRange[0].endDate)) {
                    return false;
                }
                return true;
            });
        }

        const selectSchoolsChange = (value) => {
            const index = filterParam.indexOf(allFilterParam);
            if (index > -1) {
                filterParam.splice(index, 1);
            }
            if (!filterParam.includes(schoolFilterParam)) {
                filterParam.push("School")
            }
            setSelectedSchools(value);
        }

        const selectSubjectChange = (value) => {
            const index = filterParam.indexOf(allFilterParam);
            if (index > -1) {
                filterParam.splice(index, 1);
            }
            if (!filterParam.includes(subjectFilterParam)) {
                filterParam.push(subjectFilterParam)
            }
            setSelectedSubjectName(value);
        }

        const selectTeacherChange = (value) => {
            const index = filterParam.indexOf(allFilterParam);
            if (index > -1) {
                filterParam.splice(index, 1);
            }
            if (!filterParam.includes(teacherFilterParam)) {
                filterParam.push(teacherFilterParam)
            }
            setSelectedTeacherName(value);
        }

        const selectDateRange = (ranges) => {
            const index = filterParam.indexOf(allFilterParam);
            if (index > -1) {
                filterParam.splice(index, 1);
            }
            if (!filterParam.includes(dateRangeFilterParam)) {
                filterParam.push(dateRangeFilterParam)
            }
            ranges.selection.endDate.setHours(23, 59, 59);
            setDateRange([ranges.selection]);
        }

        function CreateModalUpload(props) {
            return (
                <Modal
                    {...props}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <h4>Nahrání souboru reportu</h4>
                        <p>
                            Jste si jisti, že chcete nahrát tento soubor? <b style={{color: "red"}}>Pokud jste již jiný soubor nahráli, bude přepsán.</b>
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="accept-btn my-btn-white" onClick={props.onHide}>Storno</button>
                        <button type="button" className="accept-btn" onClick={(e) => {
                            props.onHide();
                            onFileUpload(e, fileId, fileIndex);
                        }}>Nahrát
                        </button>
                    </Modal.Footer>
                </Modal>
            );
        }

        function isReviewPresent() {
            if (!reviews || reviews.length == 0) {
                return;
            }
            if (shouldCall === false) {
                return;
            }
            if (shouldCall) {
                setShouldCall(false);
            }
            Object.keys(reviews).forEach(key => {
                let id = key;
                let name = reviews[key]
                document.getElementById(key + " " + name).classList.remove('review-btn-not-disabled');
            });
        }

        return (
            <Container fluid>
                <div>
                    <button id="toggleBtn" className="toggleButtonFilters" onClick={() => {
                        setShowing(!showing);
                        changeBtnText();
                    }}><BsSearch style={iconStyles}/> {btnText}</button>
                    <div style={{overflow: 'hidden'}}>
                        <div className={!showing ? 'hideDiv' : 'calendarDivHeight'}>
                            <div className="customFilters">
                                <div className="col align-self-center">
                                    <div className="align-self-center search-school">
                                        <p>Vyberte předmět</p>
                                        <Combobox
                                            data={subjects}
                                            value={selectedSubjectName}
                                            onChange={value => selectSubjectChange(value)}
                                        />
                                    </div>
                                </div>
                                <div className="col align-self-center search-date">
                                    <p>Vyberte datum (od - do)</p>
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={item => selectDateRange(item)}
                                        moveRangeOnFirstSelection={false}
                                        ranges={dateRange}
                                        locale={rdrLocales.cs}
                                        minDate={dateLimit[0]}
                                        maxDate={dateLimit[1]}
                                    />
                                </div>
                            </div>
                            <div className="center">
                                <button id="filterResetBtn" className="filterResetBtn" onClick={() => {
                                    resetFilter();
                                }}><BsFillXCircleFill style={iconStyles}/> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr/>
                </div>
                {!filterParam.includes(allFilterParam) && <div className="customAlertContainer">
                    <div className="p-3 m-3 center my-alert-filter alert-danger alertCustom">
                        <BsSliders style={iconStyleFilter}/>
                        <span><b>Filtr je aktivní</b></span>
                    </div>
                </div>}
                <Accordion>
                    <div style={{width: "100%"}}>
                        <div className="title-container text-info-practice">
                            <Row style={{width: "100%"}}>
                                <Col className="text-center">
                                    <b>Předmět</b>
                                </Col>
                                <Col className="text-center d-none">
                                    <b>Učitel</b>
                                </Col>
                                <Col className="text-center">
                                    <b>Datum</b>
                                </Col>
                                <Col className="text-center">
                                    <b>Čas</b>
                                </Col>
                                <Col className="text-center d-none">
                                    <b>E-mail</b>
                                </Col>
                                <Col className="text-center d-none">
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip>
                                                Počet aktuálně zapsaných studentů / maximální počet
                                                studentů na praxi.
                                            </Tooltip>
                                        }
                                    >
                                    <span>
                                        <BsInfoCircleFill className={"info-tooltip mb-1"}/>
                                    </span>
                                    </OverlayTrigger>
                                    <b>Kapacita</b>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    {search(practices).length === 0 ?
                        <div className="alert alert-danger center warnTextPractices"><span>Nebyly nalezeny žádné praxe odpovídající zadaným parametrům.</span>
                        </div> : null}
                    {practices && search(practices).map((item, index) => (
                        <Accordion.Item
                            eventKey={item.id}
                            onClick={() => isReviewPresent()}
                            key={index}
                            style={{display: "block"}}
                        >
                            <div style={{display: "flex"}}>
                                <Accordion.Header className={"accordion-header-listed-teacher"}>
                                    <Row style={{width: "100%"}}>
                                        <Col
                                            className="text-center  ">{item.subject != null ? item.subject.name : subjectNotFound}</Col>
                                        <Col className="text-center d-none">
                                            {item.teacher.firstName + " " + item.teacher.secondName}
                                        </Col>
                                        <Col className="text-center">
                                            {item.date.split("-")[2] +
                                            ". " +
                                            item.date.split("-")[1] +
                                            ". " +
                                            item.date.split("-")[0]}
                                        </Col>
                                        <Col className="text-center">
                                            {item.start.split(":")[0] +
                                            ":" +
                                            item.start.split(":")[1] +
                                            " - " +
                                            item.end.split(":")[0] +
                                            ":" +
                                            item.end.split(":")[1]}
                                        </Col>
                                        <Col className="text-center d-none">
                                            {item.teacher.username}
                                        </Col>
                                        <Col className="text-center badge d-none">
                                            <div>
                                                <Badge
                                                    bg={
                                                        item.numberOfReservedStudents < item.capacity - 1
                                                            ? "success"
                                                            : "danger"
                                                    }
                                                >
                                                    {item.numberOfReservedStudents} / {item.capacity}
                                                </Badge>
                                            </div>
                                        </Col>
                                    </Row>
                                </Accordion.Header>
                            </div>

                            <Accordion.Body>
                                <div className="row listed-practices-row">
                                    <hr/>
                                    <div className="col responsive-accordion-body" style={{marginLeft: "50px"}}>
                                        <b>Kapacita: </b>
                                        <span>
                                        <Badge
                                            bg={
                                                item.numberOfReservedStudents < item.capacity - 1
                                                    ? "success"
                                                    : "danger"
                                            }
                                        >
                                            {item.numberOfReservedStudents} / {item.capacity}
                                        </Badge>
                                    </span>
                                        <div className="my-cstm-flex registered-student-right-margin" style={{marginTop: "10px"}}>
                                            <div className="w-75"><b>Registrovaní studenti: </b>
                                                <div className="mb-2 mt-2">
                                                    {item.studentNames.length === 0 &&
                                                    <span><i>Žádný student se na praxi nezaregistroval.</i></span>}
                                                </div>
                                                <div>{item.studentNames.map((name, index) => (
                                                    <div className="col">
                                                        <div
                                                            className="margin-left-cstm my-cstm-flex justify-content-between mb-3 mt-3">
                                                            <div><p><BsCheckLg style={iconStylesMail}/> {name}</p> <p><BsMailbox
                                                                style={iconStylesMail}/> {item.studentEmails[index]}</p>
                                                            </div>
                                                            <div
                                                                className="my-cstm-flex justify-content-center align-items-center">
                                                                <button
                                                                    id={item.id + " " + name}
                                                                    disabled={false}
                                                                    onClick={() => {
                                                                        getStudentReview(item.studentEmails[index], item.id)
                                                                    }}
                                                                    className="review-btn review-show-btn review-btn-not-disabled passed-btn">Hodnocení
                                                                </button>
                                                            </div>

                                                        </div>
                                                        <div className="class-name"></div>
                                                    </div>))}
                                                </div>
                                            </div>
                                        </div>

                                        <p style={{marginTop: "10px"}}><b>Poznámka:</b> {item.note != null ? item.note :
                                            <i>{noteNotFound}</i>}</p>

                                        <p style={{marginTop: "10px"}}><b>Soubory ke stažení:</b></p>
                                        <ul>
                                            {item.fileNames.length === 0 ?
                                                <p><i>Žádný soubor nebyl nahrán.</i></p>
                                                : ""}
                                            {item.fileNames.map((name, index) => (
                                                <li key={index}>
                                                    <a href={`${URL}/user/download/${item.teacher.username}/${name}`}>{name}</a>
                                                </li>
                                            ))
                                            }
                                        </ul>

                                    </div>
                                    <div className="center col div-cstm-flex-direction">
                                        <Form>
                                            <Form.Group onChange={onFileChange} controlId="formFile" className="mb-3">
                                                <Form.Control type="file" accept={ALLOWED_REPORT_EXTENSIONS_WITH_DOT}/>
                                            </Form.Group>
                                        </Form>
                                        <button className="toggleButtonFilters w-50" disabled={buttonDisabled}
                                                onClick={() => {
                                                    setFileId(item.id);
                                                    setFileIndex(index);
                                                    setModalShowUpload(true);
                                                }}>
                                            Nahrát report
                                        </button>
                                        <div className="mt-3 mb-1 flex-cont">
                                            <hr style={{width: "100%"}}/>
                                            <div className="center flex-it">
                                                <b>Report ke stažení: </b>
                                                <div>
                                                    <OverlayTrigger
                                                        overlay={
                                                            <Tooltip>
                                                                Toto uvidíte pouze vy, koordinátoři a student, který byl
                                                                zapsán
                                                                na
                                                                tuto praxi.
                                                            </Tooltip>
                                                        }
                                                    >
                                                    <span>
                                                        <BsInfoCircleFill className={"info-tooltip mb-1"}/>
                                                    </span>
                                                    </OverlayTrigger>
                                                </div>
                                            </div>
                                            <br/>
                                            {!item.report &&
                                            <span><i>Této praxi zatím nebyl přiřazen žádný report.</i></span>
                                            }
                                            <div style={{marginRight: "20px"}}>
                                            <span className="d-inline-block text-truncate flex-it"
                                                  style={{maxWidth: "300px"}}>
                                                {item.report && <a className="report-dl"
                                                                   href={`${URL}/user/report/download/${item.id}`}>
                                                    <img
                                                        src={DLImage}
                                                        style={{
                                                            height: "30px",
                                                            marginRight: "5px",
                                                            textOverflow: 'ellipsis'
                                                        }} alt={"DLImg"}/> {item.report}</a>


                                                }
                                            </span>
                                            </div>
                                            {errorMessage && alertId === index &&
                                            <div className="alert alert-danger mt-2 center warnTextPractices">
                                                <span>{errorMessage}</span></div>}
                                            {successMessage && alertId === index &&
                                            <div className="alert alert-success mt-2 center text-bold" role="alert">
                                                <span>{successMessage}</span>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
                <CreateModalReview
                    show={modalShowReview}
                    onHide={() => {
                        setModalShowReview(false);
                        setSelectedReview("")
                    }}
                />
                <CreateModalUpload
                    show={modalShowUpload}
                    onHide={() => setModalShowUpload(false)}
                />
            </Container>
        );
    }
;

export default TeacherPassedPractices;