import React, {useState, useEffect} from "react";
import {Table, withTableActions, Button, TextInput, Select} from '@gravity-ui/uikit';
import {Pencil,TrashBin,Eye, ChevronsExpandUpRight, ChevronsCollapseUpRight} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import PodpiskakaChangePopup from "../../components/PodpiskakaChangePopup";
import './style.scss';
import { toaster } from '@gravity-ui/uikit/toaster-singleton-react-18';
import {RangeCalendar} from '@gravity-ui/date-components';
import {dateTimeParse, dateTime} from '@gravity-ui/date-utils';
import config from '/public/config.js';

const MyTable = withTableActions(Table);

export default function Subscription() {
    const [data, setData] = React.useState([]);
    const [refresh_flag, setRefresh_Flag] = React.useState(false);
    const [refresh_flag2, setRefresh_Flag2] = React.useState(false);
    const [fullscr, setFullScr] = React.useState('min');
    const ludishkaEmailRef = React.useRef(null);
    const [errors, setErrors] = React.useState({});
    const [ludishkaNameStatus, setLudishkaNameStatus] = React.useState({});
    const [ludishkaEmailStatus, setLudishkaEmailStatus] = React.useState({});
    const [newDateStart, setNewDateStart] = React.useState(0);
    const [newDateEnd, setNewDateEnd] = React.useState(0);
    const [ludishkaEmailValue, setLudishkaEmailValue] = React.useState(1);
    const [newOptionsUser, setNewOptionsUser] = React.useState([]);
    const [newOptionsBook, setNewOptionsBook] = React.useState([]);
    const [ludishkaReaderValue, setLudishkaReaderValue] = React.useState([]);
    const [ludishkaBookValue, setLudishkaBookValue] = React.useState([]);
    const [ludishkaReaderStatus, setLudishkaReaderStatus] = React.useState([]);
    const [ludishkaBookStatus, setLudishkaBookStatus] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [ludishkaId, setLudishkaId] = React.useState(null);
    const popupRef = React.useRef(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        const year = date.getFullYear();
        
        return `${day}.${month}.${year}`; // Формат: DD.MM.YYYY
    };

    useEffect(() => {
        fetch(`${config.baseURL}/subscription?expand=reader,book`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt.data);
            const filtered = dt.data.filter((item) => item.id !== null);

            // Форматируем дату
            const formattedData = filtered.map(item => ({
                ...item,
                issueDate: formatDate(item.issueDate), // Форматируем дату
                returnDate: formatDate(item.returnDate), // Форматируем дату
                reader: item.reader?.email,
                book: item.book?.title,
            }));

            setData(formattedData);
        }).catch(err => console.log(err))
    }, [refresh_flag, open]);
    useEffect(() => {
        fetch(`${config.baseURL}/book?fields=id,title`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt.data);
            const filtered = dt.data.filter((item) => item.id !== null);

            // Форматируем дату
            const formattedData = filtered.map(item => ({
                ...item,
                value: item.id,
                content: item.title,
            }));

            setNewOptionsBook(formattedData);
        }).catch(err => console.log(err))
        fetch(`${config.baseURL}/reader?fields=id,email`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log("response", response);
            return response.json();
        }).then((dt) => {
            console.log("data", dt.data);
            const filtered = dt.data.filter((item) => item.id !== null);

            // Форматируем дату
            const formattedData = filtered.map(item => ({
                ...item,
                value: item.id,
                content: item.email,
            }));

            setNewOptionsUser(formattedData);
        }).catch(err => console.log(err))
    }, [refresh_flag2]);
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
                    fetch(`${config.baseURL}/subscription/${rowData.id}`, {
                        method: 'DELETE'
                    }).then((response) => {
                        console.log("response", response);
                        if (response.status === 204 || response.ok) {
                            toaster.add({
                                name: 'success',
                                title: 'Подписка успешно удалена',
                                theme: 'success'
                            })
                            setRefresh_Flag(!refresh_flag);
                        } else {
                            toaster.add({
                                name: 'error',
                                title: 'Не удалось удалить подписку, попробуйте позже',
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
    const columns = [{id: 'id'}, {id: 'issueDate'}, {id: 'returnDate'}, {id: 'reader'}, {id: 'book'}, {id: 'status'}];
    return (
        <>
            <PodpiskakaChangePopup ref={popupRef} open={open} id={ludishkaId} onClose={() => setOpen(false)} />
            <div className="row">
                <div className="table-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Список подписок
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <MyTable data={data} columns={columns} getRowActions={getRowActions} verticalAlign="middle" width="max" emptyMessage="Подписок больше нет ¯\_(ツ)_/¯"/>
                </div>
                <div className="creation-box box">
                    <div className="table-options-wrapper">
                        <h3>
                            Добавить подписку
                        </h3>
                        <div className="table-options" onClick={() => setFullScr(fullscr === 'full' ? 'min' : 'full')}>
                            <Icon data={fullscr === 'min' ? ChevronsExpandUpRight : ChevronsCollapseUpRight} size={18}/>
                        </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                        <RangeCalendar onUpdate={(e) => {setNewDateStart(e.start._timestamp); setNewDateEnd(e.end._timestamp);}} validationState={ludishkaNameStatus} errorMessage={errors.ludishkaName} view="normal" size='l' />
                    </div>
                    <Select onUpdate={(e) => setLudishkaEmailValue(e[0])} ref={ludishkaEmailRef} validationState={ludishkaEmailStatus} errorMessage={errors.ludishkaEmail} view="normal" size='l' placeholder="Статус"
                    options={[
                        {value: 0, content: 'Завершён'},
                        {value: 1, content: 'Действителен'},
                    ]} />
                    <Select onUpdate={(e) => setLudishkaReaderValue(e[0])} validationState={ludishkaReaderStatus} errorMessage={errors.ludishkaReader} view="normal" size='l' placeholder="Читатель"
                    options={newOptionsUser} />
                    <Select onUpdate={(e) => setLudishkaBookValue(e[0])} validationState={ludishkaBookStatus} errorMessage={errors.ludishkaBook} view="normal" size='l' placeholder="Книжонка"
                    options={newOptionsBook} />
                    <Button view="outlined-info" size="l" onClick={() => {
                        console.log(newDateStart, " - ", newDateEnd, " ", ludishkaEmailValue);
                        const validationErrors = {};
                        if (newDateStart.length === 0 || newDateEnd.length === 0) {
                            validationErrors.ludishkaName = 'Нужно выбрать дату';
                            setLudishkaNameStatus("invalid");
                        } else {
                            setLudishkaNameStatus("normal");
                            delete validationErrors.ludishkaName;
                        }
                        setErrors(validationErrors);
                        if (Object.keys(validationErrors).length === 0) {
                            fetch(`${config.baseURL}/subscription`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    issueDate: new Date(newDateStart),
                                    returnDate: new Date(newDateEnd),
                                    status: ludishkaEmailValue.toString(),
                                    reader: ludishkaReaderValue ? ludishkaReaderValue : null,
                                    book: ludishkaBookValue ? ludishkaBookValue : null
                                })
                            }).then((response) => {
                                console.log("response", response);
                                if (response.status === 201 && response.ok) {
                                    toaster.add({
                                        name: 'success',
                                        title: 'Подписка успешно добавлена',
                                        theme: 'success'
                                    })
                                    setRefresh_Flag(!refresh_flag);
                                } else {
                                    toaster.add({
                                        name: 'error',
                                        title: 'Не удалось добавить подписку, попробуйте позже',
                                        theme: 'danger'
                                    })
                                }
                                return response.json();
                            }).catch(err => console.log(err))
                        }
                    }}>Добавить подписку</Button>
                </div>
            </div>
        </>
    )
}