import React, {useState, useEffect} from "react";
import {Table, withTableActions, Button, TextInput} from '@gravity-ui/uikit';
import {Pencil,TrashBin,Eye, ChevronsExpandUpRight, ChevronsCollapseUpRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import LudishkaChangePopup from "../../components/LudishkaChangePopup";
import './style.scss';
import { toaster } from "@gravity-ui/uikit/toaster-singleton-react-18";
import config from '/public/config.js';

const MyTable = withTableActions(Table);

export default function Reader() {
    const [data, setData] = React.useState([]);
    const [refresh_flag, setRefresh_Flag] = React.useState(false);
    const [fullscr, setFullScr] = React.useState('min');
    const ludishkaNameRef = React.useRef(null);
    const ludishkaSurnameRef = React.useRef(null);
    const ludishkaEmailRef = React.useRef(null);
    const [errors, setErrors] = React.useState({});
    const [ludishkaNameStatus, setLudishkaNameStatus] = React.useState({});
    const [ludishkaSurnameStatus, setLudishkaSurnameStatus] = React.useState({});
    const [ludishkaEmailStatus, setLudishkaEmailStatus] = React.useState({});
    const [open, setOpen] = React.useState(false);
    const [ludishkaId, setLudishkaId] = React.useState(null);
    const popupRef = React.useRef(null);
    useEffect(() => {
        fetch(`${config.baseURL}/reader`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt.data);
            setData(dt.data)
        }).catch(err => console.log(err))
    }, [refresh_flag, open]);
    useEffect(() => {
        if (fullscr === 'full') {
            document.querySelector(".table-box").classList.add('fullscr');
            document.querySelector(".creation-box").classList.add('fullscr');
        } else {
            document.querySelector(".table-box").classList.remove('fullscr');
            document.querySelector(".creation-box").classList.remove('fullscr');
        }
    }, [fullscr]);
    const getRowActions = (rowData) => {
        return [
            {
                text: 'Исправить',
                icon: <Icon data={Pencil} size={14} />,
                handler: () => {
                    setLudishkaId(rowData.id);
                    setOpen(true);
                },
            },
            {
                text: 'Удалить',
                icon: <Icon data={TrashBin} size={14} />,
                handler: () => {
                    fetch(`${config.baseURL}/reader/${rowData.id}`, {
                        method: 'DELETE'
                    }).then((response) => {
                        console.log("response", response);
                        if (response.status === 204 || response.ok) {
                            toaster.add({
                                name: 'delete',
                                title: 'Людишка удалена',
                                theme: 'success'
                            })
                            setRefresh_Flag(!refresh_flag);
                        } else {
                            toaster.add({
                                name: 'delete',
                                title: 'Не удалось удалить людишку, попробуйте позже',
                                theme: 'danger'
                            })
                        }
                        return response.json();
                    }).catch(err => console.log(err))
                },
                theme: 'danger',
            },
        ];
    };
    const columns = [{id: 'id'}, {id: 'name'}, {id: 'surname'}, {id: 'email'}];
    return (
        <>
            <LudishkaChangePopup ref={popupRef} open={open} id={ludishkaId} onClose={() => setOpen(false)} />
            <div className="row">
                <div className="table-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Список людишек
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <MyTable data={data} columns={columns} getRowActions={getRowActions} verticalAlign="middle" width="max" emptyMessage="Людишек больше нет ¯\_(ツ)_/¯"/>
                </div>
                <div className="creation-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Добавить людишку
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <TextInput ref={ludishkaNameRef} validationState={ludishkaNameStatus} errorMessage={errors.ludishkaName} view="normal" size='l' placeholder="Имя" />
                    <TextInput ref={ludishkaSurnameRef} validationState={ludishkaSurnameStatus} errorMessage={errors.ludishkaSurname} view="normal" size='l' placeholder="Фамилия" />
                    <TextInput ref={ludishkaEmailRef} validationState={ludishkaEmailStatus} errorMessage={errors.ludishkaEmail} view="normal" size='l' placeholder="Почта" />
                    <Button view="outlined-info" size="l" onClick={() => {
                        let ludishkaName = ludishkaNameRef.current.children[0].children[0].value;
                        let ludishkaSurname = ludishkaSurnameRef.current.children[0].children[0].value;
                        let ludishkaEmail = ludishkaEmailRef.current.children[0].children[0].value;
                        const regExp = /^[а-яА-ЯёЁ\s]{2,32}$/;
                        const regExp2 = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
                        const validationErrors = {};
                        if (!regExp.test(ludishkaName)) {
                            validationErrors.ludishkaName = 'Название людишки должно содержать от 2 до 32 русских символов';
                            setLudishkaNameStatus("invalid");
                        } else {
                            setLudishkaNameStatus("normal");
                            delete validationErrors.ludishkaName;
                        }
                        if (!regExp.test(ludishkaSurname)) {
                            validationErrors.ludishkaSurname = 'Фамилия людишки должно содержать от 2 до 32 русских символов';
                            setLudishkaSurnameStatus("invalid");
                        } else {
                            setLudishkaSurnameStatus("normal");
                            delete validationErrors.ludishkaSurname;
                        }
                        if (!regExp2.test(ludishkaEmail)) {
                            validationErrors.ludishkaEmail = 'Email должен быть правильным, а не вот это вот вот';
                            setLudishkaEmailStatus("invalid");
                        } else {
                            setLudishkaEmailStatus("normal");
                            delete validationErrors.ludishkaEmail;
                        }
                        setErrors(validationErrors);
                        if (Object.keys(validationErrors).length === 0) {
                            fetch(`${config.baseURL}/reader`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    name: ludishkaName,
                                    surname: ludishkaSurname,
                                    email: ludishkaEmail
                                })
                            }).then((response) => {
                                console.log("response", response);
                                if (response.status === 201 && response.ok) {
                                    toaster.add({
                                        name: 'up',
                                        title: 'Людишка добавлена',
                                        theme: 'info'
                                    })
                                    setRefresh_Flag(!refresh_flag);
                                } else {
                                    toaster.add({
                                        name: 'up',
                                        title: 'Не удалось добавить людишку, попробуйте позже',
                                        theme: 'danger'
                                    })
                                }
                                return response.json();
                            }).catch(err => console.log(err))
                        }
                    }}>Добавить людишку</Button>
                </div>
            </div>
        </>
    )
}